import requests
import json
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text, select
import os
from dotenv import load_dotenv
from flask_cors import CORS
import datetime

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": os.getenv('FRONTEND_URL')}})
load_dotenv()

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = f"postgresql://{os.getenv('PSQL_USER')}:{os.getenv('PSQL_PASSWORD')}@{os.getenv('PSQL_HOST')}/{os.getenv('PSQL_DATABASE')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/api/employee/<name>')
def get_data(name):
    query = text("SELECT * FROM Employees WHERE employeename = :name LIMIT 1")
    result = db.session.execute(query, {'name': name}).fetchone()

    if result is not None:
        data = {'employeename': result.employeename, 'position': result.position}
        return jsonify(data)
    else:
        return jsonify({'error': 'No data found'}), 404

@app.route('/api/menu', methods=['GET', 'POST'])
def get_menu_items():
    if request.method == 'GET':
        query = text("SELECT * FROM Menu")
        results = db.session.execute(query).fetchall() 
        if results:
            data = []
            for row in results:
                item = {
                    'id' : row[0],
                    'itemName' : row[1],
                    'price' : row[2]
                }
                data.append(item)

            return jsonify(data)
        else:
            return jsonify({'error': 'No data found'}), 404
    elif request.method == 'POST':
        data = request.get_json()
        res = db.session.execute(text("SELECT MAX(id) FROM Menu")).fetchone()[0] + 1
        query = text("INSERT INTO menu (id, itemname, price) VALUES (:id, :itemName, :price);")
        db.session.execute(query, {'id': res, 'itemName': data['itemName'], 'price': data['price']})
        db.session.commit()
        return jsonify({'message': 'Menu item created successfully'}), 201
    
@app.route('/api/menu/<menu_id>', methods=['PUT', 'DELETE'])
def get_menu_item(menu_id):
    if request.method == 'PUT':
        data = request.get_json()
        query = text("UPDATE Menu SET itemName = :itemName, price = :price WHERE id = :id")
        db.session.execute(query, {'itemName': data['itemName'], 'price': data['price'], 'id': menu_id})
        db.session.commit()
        return jsonify({'message': 'Menu item updated successfully'}), 200
    elif request.method == 'DELETE':
        delete_menu_inventory_batch(menu_id)
        query = text("DELETE FROM Menu WHERE id = :id")
        db.session.execute(query, {'id': menu_id})
        db.session.commit()
        return jsonify({'message': 'Menu item deleted successfully'}), 200

#Deleting all inventory items attached to the menu item
def delete_menu_inventory_batch(menu_id):
    try:
        query = text("DELETE FROM MIJunc WHERE menuid = :menu_id")
        db.session.execute(query, {'menu_id': menu_id})
        db.session.commit()
        return jsonify({'message': 'Menu inventory deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': 'Issue with deletion' + e}), 404

@app.route('/api/inventory')
def get_inventory_items():
    query = text("SELECT * FROM Inventory")
    results = db.session.execute(query).fetchall()
    if results:
        data = []
        for row in results:
            item = {
                'id' : row[0],
                'name' : row[1],
                'stock' : row[2],
                'location' : row[3],
                'capacity' : row[4],
                'supplier' : row[5],
                'minimum' : row[6]
            }
            data.append(item)

        return jsonify(data)
    else:
        return jsonify({'error': 'No data found'}), 404

# GET: Find all low stock items
@app.route('/api/inventory/shortage', methods=['GET'])
def get_inventory_shortage():
    query = text("SELECT * FROM Inventory WHERE stock < minimum;")
    results = db.session.execute(query).fetchall()
    if results:
        data = []
        for row in results:
            item = {
                'id' : row.id,
                'name' : row.name,
                'stock' : row.stock,
                'location' : row.location,
                'supplier' : row.supplier,
                'minimum' : row.minimum
            }
            data.append(item)
        print("Returned all stock shortage items")
        return jsonify(data)
    else:
        return jsonify({'error': 'No data found'}), 404

@app.route('/api/inventory/<inventory_id>', methods=['PUT', "GET"])
def update_inventory(inventory_id):
    if request.method == 'GET':
        data = []
        if(inventory_id.isnumeric() == False):
            query = text("SELECT id FROM Inventory WHERE name = :name")
            result = db.session.execute(query, {'name': inventory_id}).fetchone()
            
        else:
            query = text("SELECT * FROM Inventory WHERE id = :id")
            result = db.session.execute(query, {'id': inventory_id}).fetchone()
        if result is not None:
            return jsonify({
                'id' : result.id,
                'name' : result.name,
                'stock' : result.stock,
                'location' : result.location,
                'supplier' : result.supplier,
                'minimum' : result.minimum
            })
        else:
            return jsonify({'error': 'No data found'}), 404
    elif(request.method == 'PUT'):
        if(inventory_id.isnumeric() == False):
            query = text("SELECT id FROM Inventory WHERE name = :name")
            result = db.session.execute(query, {'name': inventory_id}).fetchone()
            if result is not None:
                inventory_id = result[0]
            else:
                return jsonify({'error': 'No data found'}), 404
        data = request.get_json()
        query = text("UPDATE Inventory SET stock = stock + :add_stock WHERE id = :id")
        db.session.execute(query, {'add_stock': data['add_stock'], 'id': inventory_id})
        print('Updated stock for item with ID: ' + str(inventory_id))
        db.session.commit()
        return jsonify({'message': 'Stock updated successfully'}), 200
    elif(request.method == 'DELETE'):
        query = text("DELETE FROM Inventory WHERE id = :id")
        db.session.execute(query, {'id': inventory_id})
        db.session.commit()
        return jsonify({'message': 'Inventory item deleted successfully'}), 200

def update_inventory_batch(data):
    query = text("UPDATE Inventory SET stock = stock + :add_stock WHERE id = :id")
    params = [{'add_stock': item['amount'], 'id': item['id']} for item in data]
    db.session.execute(query, params)
    db.session.commit()
    
@app.route('/api/mijunc/<menu_id>', methods=['GET', 'DELETE', 'POST', 'PUT'])
def get_menu_inventory(menu_id):
    if(request.method == 'GET'):
        query = text("SELECT m.itemid, i.name, m.itemamount FROM mijunc as m JOIN Inventory as i On m.itemid = i.id WHERE menuid = :menu_id")
        try:
            results = db.session.execute(query, {'menu_id': menu_id}).fetchall()
            data = []
            print(results)
            for row in results:
                item = {
                    'itemID' : row.itemid,
                    'itemName' : row.name,
                    'itemAmount' : row.itemamount
                }
                data.append(item)

            return jsonify(data)
        except Exception as e:
            return jsonify({'error': 'No data found' + e}), 404
    elif(request.method == 'DELETE'):
        data = request.get_json()
        query = text("DELETE FROM MIJunc WHERE menuid = :menu_id AND itemid = :item_id")
        db.session.execute(query, {'menu_id': menu_id, 'item_id': data['itemID']})
        db.session.commit()
        return jsonify({'message': 'Menu inventory deleted successfully'}), 200
    elif request.method == 'POST':
        data = request.get_json()
        query = text("INSERT INTO MIJunc (menuID, itemID, itemAmount) VALUES (:menu_id, :item_id, :item_amount)")
        db.session.execute(query, {'menu_id': menu_id, 'item_id': data['itemID'], 'item_amount': data['itemAmount']})
        db.session.commit()
        return jsonify({'message': 'Menu inventory created successfully'}), 201
    elif request.method == 'PUT':
        data = request.get_json()
        query = text("UPDATE MIJunc SET itemAmount = :item_amount WHERE menuID = :menu_id AND itemID = :item_id")
        db.session.execute(query, {'item_amount': data['itemAmount'], 'menu_id': menu_id, 'item_id': data['itemID']})
        db.session.commit()
        return jsonify({'message': 'Menu inventory updated successfully'}), 200

#Needed to get all the inventory items that are not in the list of a menu item
@app.route('/api/mijunc/outside/<menu_id>', methods=['GET'])
def get_outside_menu_inventory(menu_id):
    query = text("SELECT DISTINCT inv.id, inv.name FROM Inventory as inv WHERE inv.id NOT IN (SELECT i.id FROM mijunc as m JOIN Inventory as i On m.itemid = i.id WHERE menuid = :menu_id);")
    try:
        results = db.session.execute(query, {'menu_id': menu_id}).fetchall()
        data = []
        print(results)
        for row in results:
            item = {
                'itemID' : row.id,
                'itemName' : row.name,
            }
            data.append(item)
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': 'No data found' + e}), 404

@app.route('/api/order', methods=['POST'])
def update_orders():
    if(request.method == 'POST'):
        data = request.get_json() #turns the JSON into a python dict

        # Insert order
        curr_time = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        query = text("INSERT INTO orders (customerName, time, paid, EmployeeID) VALUES (:customer_name, :time, :paid, :employee_id);")
        db.session.execute(query, {'customer_name': data['customer_name'], 'time': curr_time, 'paid': data['paid'], 'employee_id': data['employee_id']})
        
        # Get the order id
        query = text("SELECT * FROM orders WHERE :customer_name = customerName AND :time = time AND :paid = paid AND :employee_id = EmployeeID")
        order_id = db.session.execute(query, {'customer_name': data['customer_name'], 'time': curr_time, 'paid': data['paid'], 'employee_id': data['employee_id']}).fetchone()[0]
        print('Inserted order for customer: ' + data['customer_name'] + " successfully with ID: " + str(order_id))
        
        # Insert order menu items
        for menu_id in data['menu_items']:
            query = text("INSERT INTO OMJunc (menuID, orderID) VALUES (:menu_id, :order_id)")
            db.session.execute(query, {'menu_id': menu_id, 'order_id': order_id})

        # Decreasing the stock from the menu items
        query = text("SELECT itemID, itemAmount FROM MIJunc WHERE menuID IN :menu_items")
        results = db.session.execute(query, {'menu_items': tuple(data['menu_items'])}).fetchall() #Returns it in the form of (itemID, itemAmount)
        data = []
        for inventory in results:
            data.append({ "id": inventory[0], "amount": float(-inventory[1]) })
        if data is not None:
            update_inventory_batch(data)
            print('Decreased stock for menu item with ID: ' + str(menu_id))

        db.session.commit()
        return jsonify({'message': 'Order created successfully'}), 201

if __name__ == '__main__':
    app.run(debug=True, port=5000)
