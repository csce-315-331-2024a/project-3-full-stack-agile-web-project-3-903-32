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
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})
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
        print(result.employeename)
        return jsonify(data)
    else:
        print("ADJKANKLAW")
        return jsonify({'error': 'No data found'}), 404

@app.route('/api/menu')
def get_menu_items():
    query = text("SELECT itemName, price FROM Menu")
    results = db.session.execute(query).fetchall() 
    print(results)
    if results:
        data = []
        for row in results:
            item = {
                'itemName' : row[0],
                'price' : row[1]
            }
            print(row[0])
            print(row[1])
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

@app.route('/api/inventory/<inventory_id>', methods=['PUT'])
def update_inventory(inventory_id):
    if(request.method == 'PUT'):
        data = request.get_json()
        query = text("UPDATE Inventory SET stock = stock + :add_stock WHERE id = :id")
        db.session.execute(query, {'add_stock': data['add_stock'], 'id': inventory_id})
        db.session.commit()
        print('Updated stock for item with ID: ' + inventory_id)
        return jsonify({'message': 'Stock updated successfully'}), 200

@app.route('/api/inventory/batch/', methods=['PUT'])
def update_inventory_batch():
    if(request.method == 'PUT'):
        data = json.loads(request.get_json()) #json.loads turns the JSON str into a python list
        query = text("UPDATE Inventory SET stock = stock + :add_stock WHERE id = :id")
        for item in data:
            db.session.execute(query, {'add_stock': item['amount'], 'id': item['id']})
        db.session.commit()
        return jsonify({'message': 'Stock updated successfully'}), 200


@app.route('/api/order', methods=['POST'])
def update_orders():
    if(request.method == 'POST'):
        data = request.get_json() #turns the JSON into a python dict
        
        # Insert order
        curr_time = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        query = text("INSERT INTO orders (customerName, time, paid, EmployeeID) VALUES (:customer_name, :time, :paid, :employee_id);")
        db.session.execute(query, {'customer_name': data['customer_name'], 'time': curr_time, 'paid': data['paid'], 'employee_id': data['employee_id']})
        db.session.commit()
        
        # Get the order id
        query = text("SELECT * FROM orders WHERE :customer_name = customerName AND :time = time AND :paid = paid AND :employee_id = EmployeeID")
        order_id = db.session.execute(query, {'customer_name': data['customer_name'], 'time': curr_time, 'paid': data['paid'], 'employee_id': data['employee_id']}).fetchone()[0]
        print('Inserted order for customer: ' + data['customer_name'] + " successfully with ID: " + str(order_id))
        
        # Insert order menu items
        for menu_id in data['menu_items']:
            query = text("INSERT INTO OMJunc (menuID, orderID) VALUES (:menu_id, :order_id)")
            db.session.execute(query, {'menu_id': menu_id, 'order_id': order_id})
        db.session.commit()
        
        for menu_id in data['menu_items']:
            query = text("SELECT itemID, itemAmount FROM MIJunc WHERE menuID = :menu_id")
            results = db.session.execute(query, {'menu_id': menu_id}).fetchall()
            data = []
            for inventory in results:
                data.append({ "id": inventory[0], "amount": float(-inventory[1]) })
            if(data is not None):
                put_url = f'http://localhost:5000/api/inventory/batch/'
                res = requests.put(put_url, json=json.dumps(data)) #json.dumps turns the entire list into a JSON str(a python str)
                if res.status_code == 200:
                    print('Decreased stock for menu item with ID: ' + str(menu_id), str(inventory[1]))
        return jsonify({'message': 'Order created successfully'}), 201
if __name__ == '__main__':
    app.run(debug=True, port=5000)
