import random
import requests
import json
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text, select
import os
from dotenv import load_dotenv
from flask_cors import CORS
from datetime import datetime
import deepl
from collections import defaultdict

app = Flask(__name__)
CORS(app)
load_dotenv()

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = f"postgresql://{os.getenv('PSQL_USER')}:{os.getenv('PSQL_PASSWORD')}@{os.getenv('PSQL_HOST')}/{os.getenv('PSQL_DATABASE')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

@app.route('/')
def hello_world():
    return 'Hello, World!'

###################################
#             Employee API        #
###################################
@app.route('/api/employee/<name>')
def get_data(name):
    """
    Get employee data by name.

    Args:
        name (str): The name of the employee to retrieve data for.

    Returns:
        A JSON response containing the employee's data if found, or an error message if not found.

    """
    query = text("SELECT * FROM Employees WHERE employeename = :name LIMIT 1")
    result = db.session.execute(query, {'name': name}).fetchone()

    if result is not None:
        data = {'employeename': result.employeename, 'position': result.position}
        return jsonify(data)
    else:
        return jsonify({'error': 'No data found'}), 404
    
@app.route('/api/employee/gmail/<email>')
def get_data_email(email):
    """
    Gets a empolyees' name and position from an employee email.

    Args:
        email(str) : The email of the employee to retrieve the relvant data in the database.
    Returns:
        A JSON of the employee info containing name, position and email or an error message if no data is found.
    """
    print("TESTING")
    query = text("SELECT * FROM Employees WHERE email = :email LIMIT 1")
    result = db.session.execute(query, {'email': email}).fetchone()
    print(result)
    if result is not None:
        data = {'employeename': result.employeename, 'position': result.position, 'email': result.email}
        return jsonify(data)
    else:
        return jsonify({'error': 'No data found'}), 404
    
@app.route('/api/employee/all')
def get_all_employees():
    """
    Returns a list of the employees and their information.

    Returns:
        A JSON of all employees and their info including name, position and email or return an error if no data is found.
    """
    query = text("SELECT * FROM Employees")
    result = db.session.execute(query).fetchall()
    if result is not None:
        employee_list = [{"name": row[1], "position": row[2], "email": row[3]} for row in result]
        return jsonify(employee_list)
    else:
        return jsonify({'error': 'No data found'}), 404

@app.route('/api/employee/change/<email>', methods=['PUT', 'DELETE'])
def get_employee(email):
    """
    Updates or deletes the an employee information

    Args:
        email (str): The email of the employee used to identify them in the database.

    If the HTTP is PUT:
        it will update given the inputs nescessary.
    If the HTTP is DELETE:
        it will delete an employee entry given an email.
    Returns: 
        A JSON containing a success message.
    """
    if request.method == 'PUT':
        data = request.get_json()
        query = text("UPDATE Employees SET employeename = :employeename, position = :position,  WHERE email = :email")
        db.session.execute(query, {'employeename': data['employeename'], 'position': data['position'], 'email': email})
        db.session.commit()
        return jsonify({'message': 'Employee object updated successfully'}), 200
    elif request.method == 'DELETE':
        query = text("DELETE FROM Employees WHERE email = :email")
        db.session.execute(query, {'email': email})
        db.session.commit()
        return jsonify({'message': 'Employee object deleted successfully'}), 200
    
@app.route('/api/employee/add')
def add_employee():
    """
    Adds a new entry into the employees database

    Returns:
        A JSON containing a success message
    """
    data = request.get_json()
    query = text("INSERT INTO employees (employeename, position, email) VALUES (:employeename, :position, :email);")
    db.session.execute(query, {'employeename': data['employeename'], 'position': data['position'], 'email': data['email']})
    db.session.commit()
    return jsonify({'message': 'Employee object created successfully'}), 201

###################################
#             MENU API            #
###################################
@app.route('/api/menu', methods=['GET', 'POST'])
def get_menu_items():
    """
    Get menu items or create a new menu item.

    If the HTTP method is GET:
    Returns a JSON response containing all menu items sorted by itemName in ascending order.
    Optionally, if 'translate' parameter is provided in the query string and is not 'EN', 
    translates the itemName to the specified language.

    If the HTTP method is POST:
        Creates a new menu item using data from the request body and returns a JSON response.

    Returns:
        A JSON response containing menu items or a success message.

    """
    if request.method == 'GET':
        query = text("SELECT * FROM Menu ORDER BY itemName ASC")
        results = db.session.execute(query).fetchall() 
        if results:
            data = []
            if 'translate' in request.args and request.args.get("translate") != 'EN':
                texts = []
                for row in results:
                    texts.append(str(row[1]))
                names = translator.translate_text(text=texts, target_lang=request.args.get("translate"))
                for i, row in enumerate(results):
                    item = {
                        'id' : row[0],
                        'itemName' : names[i].text,
                        'price' : row[2],
                        'category' : row[3]
                    }
                    data.append(item)
            else:
                for row in results:
                    item = {
                        'id' : row[0],
                        'itemName' : row[1],
                        'price' : row[2],
                        'category' : row[3]
                    }
                    data.append(item)
            return jsonify(data)
        else:
            return jsonify({'error': 'No data found'}), 404
    elif request.method == 'POST':
        data = request.get_json()

        # Check if the item name already exists
        check_query = text("SELECT * FROM Menu WHERE itemName = :itemName")
        existing_item = db.session.execute(check_query, {'itemName': data['itemName']}).fetchone()
        if existing_item:
            return jsonify({'error': 'Item with this name already exists'}), 400

        query = text("INSERT INTO menu (itemname, price, category) VALUES (:itemName, :price, :category);")
        db.session.execute(query, {'itemName': data['itemName'], 'price': data['price'], 'category': data['category']})
        db.session.commit()
        return jsonify({'message': 'Menu item created successfully'}), 201


@app.route('/api/menu/category', methods=['GET'])
def get_menu_category():
    """
    Get menu categories.

    Returns a JSON response containing the available categories of menu items.

    Returns:
        A JSON response containing menu categories.

    Raises:
        Exception: If there is an error retrieving the menu categories.
    """

    if request.method == 'GET':
        try:
            data = get_category_types()
            return jsonify(data)
        except:
            return jsonify({'error': 'No data found'}), 404


def get_category_types():
    """
    Get menu category types.

    Returns a list of menu category types sorted in ascending order.

    Returns:
        list: A list containing menu category types.

    Raises:
        Exception: If no category types are found in the database.
    """
    query = text("SELECT enumlabel FROM pg_enum ORDER BY enumlabel ASC")
    results = db.session.execute(query).fetchall()
    if not results:
        raise Exception('No data found')
    data = []
    for row in results:
        data.append(row[0])
    return data

    
@app.route('/api/menu/<menu_id>', methods=['PUT', 'DELETE'])
def get_menu_item(menu_id):
    """
    Retrieves or updates a menu item in the database.

    Args:
        menu_id (int): The ID of the menu item to retrieve or update.

    Returns:
        If the HTTP method is PUT:
            dict: A JSON object containing a success message if the menu item is updated successfully.

        If the HTTP method is DELETE:
            dict: A JSON object containing a success message if the menu item is deleted successfully.

    Raises:
        HTTPException: If the request method is not PUT or DELETE.

    """
    if request.method == 'PUT':
        data = request.get_json()
        # print(data)
        query = text("UPDATE Menu SET itemName = :itemName, price = :price, category = :category WHERE id = :id")
        db.session.execute(query, {'itemName': data['itemName'], 'price': data['price'], 'category': data['category'], 'id': menu_id})
        db.session.commit()
        return jsonify({'message': 'Menu item updated successfully'}), 200
    elif request.method == 'DELETE':
        delete_menu_mijunc_batch(menu_id)
        delete_menu_omjunc_batch(menu_id)
        query = text("DELETE FROM Menu WHERE id = :id")
        db.session.execute(query, {'id': menu_id})
        db.session.commit()
        return jsonify({'message': 'Menu item deleted successfully'}), 200

    
def delete_menu_omjunc_batch(menu_id):
    """
    Deletes menu item entries from the OMJunc database associated with the given menu ID.

    Args:
        menu_id (int): The ID of the menu item to be deleted.

    Returns:
        dict: A JSON object containing a success message if the deletion is successful,
              or an error message if an issue occurs.

    Raises:
        Exception: If there's an issue with the deletion process.


    """
    try:
        query = text("DELETE FROM OMJunc WHERE menuid = :menu_id")
        db.session.execute(query, {'menu_id': menu_id})
        db.session.commit()
        return jsonify({'message': 'Menu order deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': 'Issue with deletion' + e}), 404


#Deleting all inventory items attached to the menu item
def delete_menu_mijunc_batch(menu_id):
    """
    Deletes menu item entries from the MIJunc database associated with the given menu ID.

    Args:
        menu_id (int): The ID of the menu item to be deleted.

    Returns:
        dict: A JSON object containing a success message if the deletion is successful,
        or an error message if an issue occurs.

    Raises:
        Exception: If there's an issue with the deletion process.


    """
    try:
        query = text("DELETE FROM MIJunc WHERE menuid = :menu_id")
        db.session.execute(query, {'menu_id': menu_id})
        db.session.commit()
        return jsonify({'message': 'Menu inventory deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': 'Issue with deletion' + e}), 404


###################################
#             Inventory API       #
###################################
@app.route('/api/inventory', methods=['GET', 'POST'])
def get_inventory_items():
    """
    Retrieves a list of inventory items or inserts a new entry into the inventory database.

    If the HTTP method is GET:
        Retrieves a list of inventory items from the database and returns it as JSON.

        Returns:
            list: A JSON array containing inventory items, each item includes the following fields:
                - id (int): The unique identifier of the inventory item.
                - name (str): The name of the inventory item.
                - stock (int): The current stock level of the item.
                - location (str): The location where the item is stored.
                - capacity (int): The maximum capacity of the item.
                - supplier (str): The supplier of the item.
                - minimum (int): The minimum stock level required for the item.

            If no data is found in the database, returns a JSON object with an error message.

    If the HTTP method is POST:
        Inserts a new inventory item entry into the database.

        Request Body:
            JSON object containing the following fields:
                - name (str): The name of the inventory item.
                - stock (int): The current stock level of the item.
                - minimum (int): The minimum stock level required for the item.
                - capacity (int): The maximum capacity of the item.
                - location (str): The location where the item is stored.
                - supplier (str): The supplier of the item.

        Returns:
            dict: A JSON object containing either a success message or an error message.

        Raises:
            HTTPException: If the request data is incomplete or malformed.
    """
    if request.method == 'GET':
        query = text("SELECT * FROM Inventory ORDER BY name ASC")
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
    elif request.method == 'POST':
        data = request.get_json()
        if (data['name'] is not None
        and data['stock'] is not None
        and data['minimum'] is not None 
        and data['capacity'] is not None 
        and data['location'] is not None 
        and data['supplier'] is not None):
            query = text("SELECT id FROM Inventory Order BY id DESC LIMIT 1")
            res = db.session.execute(query).fetchone()
            if res is not None:
                new_id = res[0] + 1
            query = text("INSERT INTO Inventory (id, name, stock, minimum, capacity, location, supplier) VALUES (:id, :name, :stock, :minimum, :capacity, :location, :supplier)")
            db.session.execute(query, {'id' : new_id ,'name' : data['name'], 'stock' : data['stock'], 'minimum': data['minimum'], 'capacity': data['capacity'], 'location': data['location'], 'supplier': data['supplier']})
            db.session.commit()
        else:
            return jsonify({'error': 'Missing data'}), 400
        return jsonify({'message': 'Inventory Item created successfully'}), 201


# GET: Find all low stock items
@app.route('/api/inventory/shortage', methods=['GET'])
def get_inventory_shortage():
    """
    Returns a list of inventory items where the stock is below the minimum.

    Returns:
        JSON: A JSON object containing either:
            - A list of inventory items with the following fields:
                - id (int): The ID of the inventory item.
                - name (str): The name of the inventory item.
                - stock (int): The current stock level of the item.
                - minimum (int): The minimum stock level required for the item.
                - capacity (int): The maximum capacity of the item.
                - location (str): The location where the item is stored.
                - supplier (str): The supplier of the item.
            - A JSON object containing an error message if no items are found.

    Raises:
        Exception: If there is an error executing the database query.

    """
    query = text("SELECT * FROM Inventory WHERE stock < minimum ORDER BY name ASC")
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


@app.route('/api/inventory/<inventory_id>', methods=['PUT', "GET", "DELETE", "POST"])
def update_inventory(inventory_id):
    """
    Updates, retrieves, or deletes an inventory item.

    Args:
        inventory_id (int): The ID of the inventory item.

    Returns:
        If the HTTP method is GET:
            JSON: A JSON object containing the inventory item details if found,
                         or a JSON object with an error message if not found.

        If the HTTP method is PUT:
            JSON: A JSON object containing a success message if the inventory item is updated successfully,
                         or a JSON object with an error message if any required data is missing.

        If the HTTP method is DELETE:
            JSON: A JSON object containing a success message if the inventory item is deleted successfully.

    Raises:
        HTTPException: If the request method is not GET, PUT, or DELETE.

    """
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
        data = request.get_json()
        if (data['name'] is not None
        and data['stock'] is not None
        and data['minimum'] is not None 
        and data['capacity'] is not None 
        and data['location'] is not None 
        and data['supplier'] is not None):
            query = text("UPDATE Inventory SET name = :name, stock = :stock, minimum = :minimum, capacity = :capacity, location = :location, supplier = :supplier WHERE id = :id")
            db.session.execute(query, {'name' : data['name'], 'stock' : data['stock'], 'minimum': data['minimum'], 'capacity': data['capacity'], 'location': data['location'], 'supplier': data['supplier'], 'id': inventory_id})
            db.session.commit()
        else:
            return jsonify({'error': 'Missing data'}), 400
        return jsonify({'message': 'Inventory Item updated successfully'}), 200

    elif(request.method == 'DELETE'):
        query = text("DELETE FROM Inventory WHERE id = :id")
        db.session.execute(query, {'id': inventory_id})
        db.session.commit()
        return jsonify({'message': 'Inventory item deleted successfully'}), 200

@app.route('/api/inventory/<inventory_id>/add', methods=['PUT'])
def add_inventory(inventory_id):
    """
    Retrieves a list of inventory items where the stock is below the minimum.

    Returns:
        dict or JSON: A JSON object containing either:
            - A list of inventory items with details including name, stock, minimum, capacity, location, and supplier.
            - A JSON object with an error message if no items are found.

    Raises:
        Exception: If there is an error executing the database query.

    """
    if request.method == 'PUT':
        if(inventory_id.isnumeric() == False):
            query = text("SELECT id, stock, capacity FROM Inventory WHERE name = :name")
            result = db.session.execute(query, {'name': inventory_id}).fetchone()
            if result is not None:
                inventory_id = result[0]
            else:
                return jsonify({'error': 'No data found'}), 404
        else:
            query = text("SELECT stock, capacity FROM Inventory WHERE id = :id")
            result = db.session.execute(query, {'id': inventory_id}).fetchone()
            
        data = request.get_json()

        # check if new stock is between 0 and capacity
        new_stock = result.stock + int(data['add_stock'])
        if new_stock < 0 or new_stock > result.capacity:
            return jsonify({'error': 'New stock level out of bounds'}), 400

        query = text("UPDATE Inventory SET stock = stock + :add_stock WHERE id = :id")
        db.session.execute(query, {'add_stock': data['add_stock'], 'id': inventory_id})
        db.session.commit()
        return jsonify({'message': 'Stock updated successfully'}), 200

def update_inventory_batch(data):
    """
    Retrieves menu categories.

    Returns:
        dict or JSON: A JSON object containing either:
            - A list of menu categories.
            - A JSON object with an error message if no data is found.

    Raises:
        Exception: If there is an error retrieving the menu categories.

    """
    query = text("UPDATE Inventory SET stock = stock + :add_stock WHERE id = :id")
    params = [{'add_stock': item['amount'], 'id': item['id']} for item in data]
    db.session.execute(query, params)
    db.session.commit()


###################################
#             MIJUNC API          #
###################################
@app.route('/api/mijunc/<menu_id>', methods=['GET', 'DELETE', 'POST', 'PUT'])
def get_menu_inventory(menu_id):
    """
    Retrieves, creates, updates, or deletes menu inventory items.

    Args:
        menu_id (int): The ID of the menu associated with the inventory items.

    Returns:
        dict or JSON: A JSON object containing either:
            - A list of menu inventory items with details including item ID, item name, and item amount.
            - A JSON object with a success message if an item is created, updated, or deleted.
            - A JSON object with an error message if no data is found or an error occurs during execution.

    Raises:
        Exception: If there is an error executing the database query.

    """
    if(request.method == 'GET'):
        query = text("SELECT m.itemid, i.name, m.itemamount FROM mijunc as m JOIN Inventory as i On m.itemid = i.id WHERE menuid = :menu_id  ORDER BY i.name ASC")
        try:
            results = db.session.execute(query, {'menu_id': menu_id}).fetchall()
            data = []
            # print(results)
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
    """
    Retrieves inventory items that are not included in the specified menu.

    Args:
        menu_id (int): The ID of the menu.

    Returns:
        dict or JSON: A JSON object containing either:
            - A list of inventory items that are not included in the specified menu, with details including item ID and item name.
            - A JSON object with an error message if no data is found or an error occurs during execution.

    Raises:
        Exception: If there is an error executing the database query.

    """
    query = text("SELECT DISTINCT inv.id, inv.name FROM Inventory as inv WHERE inv.id NOT IN (SELECT i.id FROM mijunc as m JOIN Inventory as i On m.itemid = i.id WHERE menuid = :menu_id) ORDER BY inv.name ASC")
    try:
        results = db.session.execute(query, {'menu_id': menu_id}).fetchall()
        data = []
        # print(results)
        for row in results:
            item = {
                'itemID' : row.id,
                'itemName' : row.name,
            }
            data.append(item)
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': 'No data found' + e}), 404


###################################
#             Ordering API        #
###################################
@app.route('/api/order', methods=['POST', 'GET'])
def update_orders():
    """
    Handles the creation of new orders and retrieval of orders within a specified time range.

    Returns:
        dict or JSON: A JSON object containing either:
            - A success message if a new order is created successfully.
            - A list of orders within the specified time range, each containing details such as ID, customer name, time, paid status, employee ID, and completion status.
            - A JSON object with an error message if no data is found or an error occurs during execution.

    Raises:
        Exception: If there is an error executing the database query.

    """
    if(request.method == 'POST'):
        data = request.get_json() #turns the JSON into a python dict

        # Insert order
        curr_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        query = text("INSERT INTO orders (customerName, time, paid, EmployeeID) VALUES (:customer_name, :time, :paid, :employee_id);")
        db.session.execute(query, {'customer_name': data['customer_name'], 'time': curr_time, 'paid': data['paid'], 'employee_id': data['employee_id']})
        
        # Get the order id
        query = text("SELECT * FROM orders WHERE :customer_name = customerName AND :time = time AND :paid = paid AND :employee_id = EmployeeID")
        order_id = db.session.execute(query, {'customer_name': data['customer_name'], 'time': curr_time, 'paid': data['paid'], 'employee_id': data['employee_id']}).fetchone()[0]
        print('Inserted order for customer: ' + data['customer_name'] + " successfully with ID: " + str(order_id))
        
        # Insert into OMJunc
        items_to_insert = [{'order_id': order_id, 'menu_id': menu_id} for menu_id in data['menu_items']]
        insert_query = text("INSERT INTO OMJunc (orderID, menuID) VALUES (:order_id, :menu_id)")

        # Execute the query in batch mode
        db.session.execute(insert_query, items_to_insert)
        
        # Decreasing the stock from the menu items
        query = text("SELECT itemID, itemAmount FROM MIJunc WHERE menuID IN :menu_items")
        results = db.session.execute(query, {'menu_items': tuple(data['menu_items'])}).fetchall() #Returns it in the form of (itemID, itemAmount)
        data = []
        for inventory in results:
            data.append({ "id": inventory[0], "amount": float(-inventory[1]) })
        if data is not None:
            update_inventory_batch(data)
            # print('Decreased stock for menu item with ID: ' + str(menu_id))

        db.session.commit()
        return jsonify({'message': 'Order created successfully'}), 201
    
    elif request.method == 'GET':
        try:
            data = request.json()
            #START AND END TIME NEED TO BE IN THE FORMAT 'YYYY-MM-DD HH:MM:SS'
            query = text("SELECT * FROM Orders WHERE time BETWEEN :start_time AND :end_time LIMIT 100")
            results = db.session.execute(query, {'start_time': data['start_time'], 'end_time': data['end_time']}).fetchall()
            data = []
            for row in results:
                item = {
                    'id' : row.id,
                    'customerName' : row.customername,
                    'time' : row.time,
                    'paid' : row.paid,
                    'employeeID' : row.employeeid,
                    'isComplete' : row.iscomplete,
                }
                data.append(item)
            return jsonify(data)
        except Exception as e:
            return jsonify({'error': 'No data found' + e}), 404


@app.route('/api/order_history')
def order_history():
    """
    Retrieves order history based on optional query parameters.

    Returns:
        dict or JSON: A JSON object containing a list of orders, each containing details such as order ID, customer name, time, items, total price, and completion status.

    Raises:
        Exception: If there is an error executing the database query.

    """
    # Get the query parameter for sorting order; default is descending
    ascending = request.args.get('ascending', 'false').lower() == 'true'
    
    time_clause = ""
    complete_clause = ""
    
    # Parse start_time and end_time from request arguments
    if 'start_time' in request.args and 'end_time' in request.args:
        start_time = request.args.get('start_time', default='')  # e.g., '2023-01-01 00:00:00'
        end_time = request.args.get('end_time')  # e.g., '2023-01-02 23:59:59'
        time_clause = f"WHERE Orders.time BETWEEN '{start_time}' AND '{end_time}'"

    if 'is_complete' in request.args:
        is_complete = request.args.get('is_complete')
        complete_clause = f"WHERE Orders.iscomplete = '{is_complete}'"
    
    order_by_clause = "ORDER BY Orders.time ASC" if ascending else "ORDER BY Orders.time DESC"
    sql_stmt = text(f"""
        SELECT 
            OMJunc.orderID, 
            Menu.itemName, 
            Menu.price, 
            Orders.customerName, 
            Orders.time,
            Orders.iscomplete
        FROM 
            OMJunc
        INNER JOIN 
            Menu ON OMJunc.menuID = Menu.id
        INNER JOIN
            Orders ON OMJunc.orderID = Orders.id
        {complete_clause}
        {time_clause}
        {order_by_clause}
        LIMIT 
            300;
    """)
    
    result = db.session.execute(sql_stmt).fetchall()
    # print(result)

    # Use a dictionary to aggregate orders
    orders = defaultdict(lambda: {
        'customerName': '',
        'time': None,
        'items': [],
        'totalPrice': 0.0,
        'isComplete': False,
    })

    # Process each row in the result
    for row in result:
        order_id = row[0]
        order = orders[order_id]
        order['customerName'] = row[3]
        order['time'] = row[4]
        order['isComplete'] = row[5]
        order['items'].append({
            'itemName': row[1],
            'price': float(row[2])
        })
        order['totalPrice'] += float(row[2])

    # Convert aggregated orders into a list
    data = [{
        'orderID': order_id,
        'customerName': info['customerName'],
        'time': info['time'],
        'items': info['items'],
        'isComplete': info['isComplete'],
        'totalPrice': round(info['totalPrice'], 2)  # Round total price to 2 decimal places
    } for order_id, info in orders.items()]

    return jsonify(data)


@app.route('/api/order/<order_id>', methods=['DELETE'])
def delete_order(order_id):
    """
    Deletes an order from the database.

    Args:
        order_id (int): The ID of the order to be deleted.

    Returns:
        dict or JSON: A JSON object with a success message if the order is deleted successfully.

    Raises:
        Exception: If there is an error executing the database query.

    """
    #Deletes the order menu junction
    delete_order_omjunc_batch(order_id)
    """
    Deletes order menu junction entries associated with the specified order.

    Args:
        order_id (int): The ID of the order.

    Returns:
        dict or JSON: A JSON object with a success message if the order menu junction entries are deleted successfully.

    Raises:
        Exception: If there is an error executing the database query.

    """
    #Deletes the order
    query = text("DELETE FROM Orders WHERE id = :order_id")
    db.session.execute(query, {'order_id': order_id})
    db.session.commit()
    return jsonify({'message': 'Order deleted successfully'}), 200


def delete_order_omjunc_batch(order_id):
    """
    Deletes order menu junction entries associated with the specified order.

    Args:
        order_id (int): The ID of the order.

    Returns:
        dict or JSON: A JSON object with a success message if the order menu junction entries are deleted successfully.

    Raises:
        Exception: If there is an issue with the deletion.

    """
    try:
        query = text("DELETE FROM OMJunc WHERE orderid = :order_id")
        db.session.execute(query, {'order_id': order_id})
        db.session.commit()
        return jsonify({'message': 'Order menu deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': 'Issue with deletion' + e}), 404


@app.route('/api/order/<order_id>', methods=['PUT'])
def update_order(order_id):
    """
    Updates an existing order in the database.

    Args:
        order_id (int): The ID of the order to be updated.

    Returns:
        dict or JSON: A JSON object with a success message if the order is updated successfully.

    Raises:
        Exception: If there is an issue with the update process.

    """
    try:
        data = request.get_json()  
        is_complete = data.get('isComplete')  # Expected to receive {"isComplete": true} or {"isComplete": false}
        customer_name = data.get('customerName')
        add_item = data.get('addItem')
        delete_item = data.get('deleteItem')
        update_item = data.get('updateItem')

        if is_complete is not None:
            query = text("UPDATE Orders SET isComplete = :is_complete WHERE id = :order_id")
            db.session.execute(query, {'is_complete': is_complete, 'order_id': order_id})

        if customer_name:
            query = text("UPDATE Orders SET customerName = :customer_name WHERE id = :order_id")
            db.session.execute(query, {'customer_name': customer_name, 'order_id': order_id})
        
        # add items (orderid, menuid, amount)
        # insert into omjunc (with orderid, menuid <amount> times)
        # update paid of orders (+ paid with amount * price)
        if add_item:
            menu_id = add_item.get('menu_id')
            amount = add_item.get('amount')

            if menu_id and amount:
                # Fetch the price from the database
                price_query = text("SELECT price FROM Menu WHERE id = :menu_id")
                menu_item = db.session.execute(price_query, {'menu_id': menu_id}).fetchone()
                
                if menu_item:
                    price = menu_item.price

                    # Insert into OMJunc
                    items_to_insert = [{'order_id': order_id, 'menu_id': menu_id} for _ in range(amount)]
                    insert_query = text("INSERT INTO OMJunc (orderID, menuID) VALUES (:order_id, :menu_id)")

                    # Execute the query in batch mode
                    db.session.execute(insert_query, items_to_insert)
                    
                    # Calculate new paid amount
                    new_paid_query = text("SELECT paid FROM Orders WHERE id = :order_id")
                    current_paid = db.session.execute(new_paid_query, {'order_id': order_id}).fetchone().paid
                    new_paid = current_paid + amount * price

                    # Update the paid amount in the Orders table
                    update_paid_query = text("UPDATE Orders SET paid = :new_paid WHERE id = :order_id")
                    db.session.execute(update_paid_query, {'new_paid': new_paid, 'order_id': order_id})
                else:
                    return jsonify({'error': 'Menu item not found'}), 404
    
        
        # delete items (orderid, menuid, amount)
        # delete from omjunc (with orderid, menuid <amount> times)
        # update paid of orders (- paid with amount * price)
        if delete_item:
            menu_id = delete_item.get('menu_id')
            amount = delete_item.get('amount')

            if menu_id and amount:
                # Fetch the price from the database
                price_query = text("SELECT price FROM Menu WHERE id = :menu_id")
                menu_item = db.session.execute(price_query, {'menu_id': menu_id}).fetchone()

                if menu_item:
                    price = menu_item.price

                    # Delete items from OMJunc table
                    delete_query = text("DELETE FROM OMJunc WHERE orderid = :order_id AND menuid = :menu_id")
                    db.session.execute(delete_query, {'order_id': order_id, 'menu_id': menu_id})
                    
                    # Calculate new paid amount
                    new_paid_query = text("SELECT paid FROM Orders WHERE id = :order_id")
                    current_paid = db.session.execute(new_paid_query, {'order_id': order_id}).fetchone().paid
                    new_paid = current_paid - amount * price

                    # Update the paid amount in the Orders table
                    update_paid_query = text("UPDATE Orders SET paid = :new_paid WHERE id = :order_id")
                    db.session.execute(update_paid_query, {'new_paid': new_paid, 'order_id': order_id})
                else:
                    return jsonify({'error': 'Menu item not found'}), 404
        
        # update amount of items (orderid, menuid, new amount)
        # if new > cur: add new items (new - cur)
        # if new < cur: delete items (cur - new)
        if update_item:
            menu_id = update_item.get('menu_id')
            old_amount = update_item.get('old_amount')
            new_amount = update_item.get('new_amount')

            # Check current amount in the database to prevent concurrent updates
            current_query = text("SELECT COUNT(*) FROM OMJunc WHERE orderID = :order_id AND menuID = :menu_id")
            current_amount = db.session.execute(current_query, {'order_id': order_id, 'menu_id': menu_id}).scalar()

            if current_amount != old_amount:
                return jsonify({'error': 'Old amount does not match current amount'}), 40

            if menu_id:
                price_query = text("SELECT price FROM Menu WHERE id = :menu_id")
                menu_item = db.session.execute(price_query, {'menu_id': menu_id}).fetchone()

                if menu_item:
                    price = menu_item.price

                    # Calculate new paid amount
                    new_paid_query = text("SELECT paid FROM Orders WHERE id = :order_id")
                    new_paid = db.session.execute(new_paid_query, {'order_id': order_id}).fetchone().paid

                    if new_amount > old_amount:
                        amount = new_amount - old_amount
                        # Insert into OMJunc
                        items_to_insert = [{'order_id': order_id, 'menu_id': menu_id} for _ in range(amount)]
                        insert_query = text("INSERT INTO OMJunc (orderID, menuID) VALUES (:order_id, :menu_id)")

                        # Execute the query in batch mode
                        db.session.execute(insert_query, items_to_insert)
                        new_paid += amount * price
                    elif new_amount < old_amount:
                        amount = old_amount - new_amount
                        delete_query = text("""
                            DELETE FROM OMJunc
                            WHERE ctid IN (
                                SELECT ctid FROM OMJunc
                                WHERE orderid = :order_id AND menuid = :menu_id
                                LIMIT :amount
                            )
                        """)
                        db.session.execute(delete_query, {'order_id': order_id, 'menu_id': menu_id, 'amount': amount})
                        new_paid -= amount * price

                    # Update the paid amount in the Orders table
                    update_paid_query = text("UPDATE Orders SET paid = :new_paid WHERE id = :order_id")
                    db.session.execute(update_paid_query, {'new_paid': new_paid, 'order_id': order_id})
                else:
                    return jsonify({'error': 'Menu item not found'}), 404                

        db.session.commit()

        return jsonify({'message': 'Order updated successfully'}), 200
    except Exception as e:
        db.session.rollback()  # Roll back the transaction in case of error
        return jsonify({'error': 'Failed to update order', 'exception': str(e)}), 500


@app.route('/api/weather')
def show_Weather():   
    """
    Retrieves weather information for a specific city using OpenWeatherMap API.

    Returns:
        dict: A JSON object containing temperature in Fahrenheit and weather description.

    """
    api_key = os.getenv('weather_api_key')
    city_name = "College Station"
    Weather_URL = "http://api.openweathermap.org/data/2.5/weather?q=" + city_name + "&appid=" + api_key
    
    response = requests.get(Weather_URL)
    weather_info = response.json()

    if weather_info['cod'] == 200:
        kelvin = 273
        temp_k = weather_info['main']['temp']
        description = weather_info['weather'][0]['description']
        
        # Convert temperatures from Kelvin to Fahrenheit
        temp_f = (temp_k - kelvin) * 9/5 + 32
        
        # Construct the response JSON object
        result = {
            "temperature_fahrenheit": round(temp_f, 2),
            "description": description
        }
    else:
        result = {
            "error": "Weather not found. COD was not 200"
        }

    return jsonify(result)


'''
Usage: /api/sales_by_time?start_time=2023-01-01%2000:00:00&end_time=2023-01-01%2023:59:59
%20 is used as a space in the URL so, the above start time is: 2023-01-01 00:00:00
End time is: 2023-01-01 23:59:59
Returns menu id : number of times ordered
'''
@app.route('/api/sales_by_time')
def sales_by_time():
    """
    Retrieves sales data for a specified time range.

    Returns:
        dict: A JSON object containing menu sales data.

    """
    # Parse start_time and end_time from request arguments
    start_time = request.args.get('start_time')  # e.g., '2023-01-01 00:00:00'
    end_time = request.args.get('end_time')  # e.g., '2023-01-02 23:59:59'

    # Adjust SQL to count occurrences of each menuID
    sql = text("""
        SELECT M.itemName, OM.menuID, COUNT(*) as frequency FROM Orders O
        JOIN OMJunc OM ON O.id = OM.orderID
        JOIN menu M ON M.id = OM.menuID
        WHERE O.time >= :start_time AND O.time <= :end_time
        GROUP BY M.itemName, OM.menuID
        ORDER BY OM.menuID;
    """)

    # Execute query with bound parameters
    result = db.session.execute(sql, {'start_time': start_time, 'end_time': end_time}).fetchall()
    # print(result)

    # Process result into a dictionary {menuID: frequency}
    
    menu_sales_data = [{'menuName': row[0], 'menuID': row[1], 'frequency': row[2]} for row in result]

    # Return JSON response
    return jsonify(menu_sales_data)


# Returns excess menu ids
@app.route('/api/excess_report')
def excess_report():
    """
    Generates a report of excess menu items based on usage compared to inventory.

    Returns:
        dict: A JSON object containing excess menu IDs and names.

    """
    start_time = request.args.get('start_time')  # Example format: '2023-01-01 00:00:00'
    end_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    sql_stmt = text("""
        SELECT MI.itemID, SUM(MI.itemAmount) AS sumAmount
        FROM OMJunc OM
        JOIN MIJunc MI ON OM.menuID = MI.menuID
        JOIN Orders O ON OM.orderID = O.id
        WHERE O.time >= :start_time AND O.time <= :end_time
        GROUP BY MI.itemID
    """)

    result = db.session.execute(sql_stmt, {'start_time': start_time, 'end_time': end_time}).fetchall()
    if result:
        data = []
        for row in result:
            item = {
                'id' : row[0],
                'Amount' : row[1],
            }
            data.append(item)
    item_amount_map = {row[0]: row[1] for row in result}
    # Adjusted for direct access without assuming dictionary-like access
    sql_inventory = text("SELECT id, stock FROM Inventory;")
    inventory_result = db.session.execute(sql_inventory).fetchall()
    excess_item_ids = [row.id for row in inventory_result if item_amount_map.get(row.id, 0) * 10 < row.stock]
    # Generate menuIDs for the identified excess items
    if excess_item_ids:
        # This step requires dynamically generating SQL, be cautious of SQL injection
        excess_item_ids_str = ', '.join(str(item_id) for item_id in excess_item_ids)
        sql_menu_ids = text(f"""
            SELECT DISTINCT MI.menuID, M.itemName
            FROM MIJunc MI
            JOIN MENU M ON MI.menuID = M.id
            WHERE MI.itemID IN ({excess_item_ids_str})
        """)
        menu_ids_result = db.session.execute(sql_menu_ids).fetchall()
        menu_ids_result.sort()
        menu_data = [{'menuID': row[0], 'menuName': row[1]} for row in menu_ids_result]
    else:
        menu_data = []

    return jsonify(menu_data)


@app.route('/api/product_usage')
def product_usage_report():
    """
    Generates a report of product usage based on sales within a specified time range.

    Returns:
        dict: A JSON object containing product usage data.

    """
    # Parse start_time and end_time from request arguments
    start_time = request.args.get('start_time')  # e.g., '2023-01-01 00:00:00'
    end_time = request.args.get('end_time')  # e.g., '2023-01-02 23:59:59'

    sql_stmt = text("SELECT I.name, SUM(MI.itemAmount) as sumAmount FROM OMJunc OM "
                        + "JOIN MIJunc MI ON OM.menuID = MI.menuID "
                        + "JOIN Orders O ON OM.orderID = O.id " 
                        + "JOIN Inventory I ON MI.itemID = I.id "
                        + "WHERE O.time >= :start_time AND O.time <= :end_time "
                        + "GROUP BY I.name;")
    
    result = db.session.execute(sql_stmt, {'start_time': start_time, 'end_time': end_time}).fetchall()
    # print(result)

    total_amount = sum(row[1] for row in result)

    # Process result into a dictionary {name: quantity, percentage}
    menu_names_list = {row[0]: {'amount': row[1], 'percentage': round((row[1] / total_amount * 100), 2)} for row in result}
    
    return jsonify(menu_names_list)


@app.route('/api/sells_together')
def what_sells_together():
    """
    Generates a report of frequently sold menu items together within a specified time range.

    Returns:
        dict: A JSON object containing pairs of menu items and their frequency of being sold together.

    """
    # Parse start_time and end_time from request arguments
    start_time = request.args.get('start_time')  # e.g., '2023-01-01 00:00:00'
    end_time = request.args.get('end_time')  # e.g., '2023-01-02 23:59:59'

    sql_stmt = text("SELECT O.id, M.itemName FROM Orders O "
                        + "JOIN OMJunc OM ON O.id = OM.orderID "
                        + "JOIN Menu M ON OM.menuID = M.id "
                        + "WHERE O.time >= :start_time AND O.time <= :end_time ORDER BY O.time;")
        
    result = db.session.execute(sql_stmt, {'start_time': start_time, 'end_time': end_time}).fetchall()
        

    menu_items_by_order_id = {}

    for row in result:
        order_id = row[0]
        menu_item = row[1]

        if order_id in menu_items_by_order_id:
            menu_items_by_order_id[order_id].append(menu_item)
        else:
            menu_items_by_order_id[order_id] = [menu_item]

    pair_frequency = {}

    for order_id, menu_items in menu_items_by_order_id.items():
        menu_items.sort()
        for i in range(len(menu_items)):
            for j in range(i + 1, len(menu_items)):
                if menu_items[i] == menu_items[j]:
                    continue
                inner_dict = pair_frequency.setdefault(menu_items[i], {})
                inner_dict[menu_items[j]] = inner_dict.get(menu_items[j], 0) + 1
                pair_frequency[menu_items[i]] = inner_dict
    
    pair_item_list = []
    for name1, inner_map in pair_frequency.items():
        for name2, frequency in inner_map.items():
            pair_with_frequency = [name1, name2, frequency]
            pair_item_list.append(pair_with_frequency)

    pair_item_list.sort(key=lambda x: x[2], reverse=True)
                        
    return jsonify(pair_item_list)
    
    
auth_key = os.getenv('DEEPL_API_KEY')
translator = deepl.Translator(auth_key)
class Language:
    def __init__(self, name, code):
        self.code = code
        self.name = name
    
    def getName(self):
        return self.name
    
    def getCode(self):
        return self.code

@app.route('/api/translate', methods=['POST', 'GET'])
def translate_route():
    """
    Translates text into the specified target language using the DeepL API.

    Returns:
        dict: A JSON object containing the translated text.

    """
    if request.method == 'GET':
        data = []
        for lang in translator.get_source_languages():
            item = {
                'name' : lang.name,
                'code' : lang.code
            }
            data.append(item)
        return jsonify(data), 200
    elif request.method == 'POST':
        try:
            data = request.get_json()
            if isinstance(data['text'], list):
                texts = data['text']
                res_lang = data['target_language']
                if res_lang == 'EN':
                    res_lang = 'EN-US'
                transformed_text = translator.translate_text(text=",".join(texts), target_lang=res_lang)
                return jsonify({'translated_text': transformed_text.text.split(",")}), 200
            else:
                text = data['text']
                res_lang = data['target_language']
                if res_lang == 'EN':
                    res_lang = 'EN-US'
                transformed_text = translator.translate_text(text=text, target_lang=res_lang)
                return jsonify({'translated_text': transformed_text.text}), 200
        except Exception as e:
            print("Bad Request", e)
            return jsonify({'error': 'Translation failed'}), 404

# @app.route('/api/translate/language', methods=['POST'])
# def translate_language():
#     data = request.get_json()
#     target_lang.code = data['language']
#     print(target_lang.code)
#     return jsonify({'message': 'Language set successfully'})

###################################
#         Recommended Item        #
###################################

def get_temp():
    """
    Retrieves the current temperature in Fahrenheit for College Station using the OpenWeatherMap API.

    Returns:
        str: A string representation of the current temperature in Fahrenheit, rounded to two decimal places.

    Raises:
        str: If the weather data is not found or the API request fails, an error message is returned.
    """
    api_key = os.getenv('weather_api_key')
    city_name = "College Station"
    Weather_URL = "http://api.openweathermap.org/data/2.5/weather?q=" + city_name + "&appid=" + api_key
    
    response = requests.get(Weather_URL)
    weather_info = response.json()

    if weather_info['cod'] == 200:
        kelvin = 273
        temp_k = weather_info['main']['temp']
        description = weather_info['weather'][0]['description']
        
        # Convert temperatures from Kelvin to Fahrenheit
        temp_f = (temp_k - kelvin) * 9/5 + 32
        
        # Return the temperature
        return str(round(temp_f, 2))

    else:
        return "Error: Weather not found. COD was not 200"
    
def get_hot_inventory():
    """
    Retrieves a random menu item categorized as hot from the database.

    Returns:
        dict: A dictionary containing the details of a randomly selected hot menu item,
              including its ID, name, and price.
    """
    query = text('''SELECT Menu.id, Menu.itemName, Menu.price
        FROM Menu
        JOIN MIJunc ON Menu.id = MIJunc.menuID
        JOIN Inventory ON MIJunc.itemID = Inventory.id
        WHERE Inventory.name IN ('Milk', 'Ice Cream', 'Water Bottles');'''
    )
    result = db.session.execute(query).fetchall()
    menu_items = [{"id": row[0], "itemName": row[1], "price": row[2]} for row in result]

    random_menu_item = random.choice(menu_items)

    return random_menu_item

def get_cold_inventory(): 
    """
    Retrieves a random menu item categorized as cold from the database.

    Returns:
        dict: A dictionary containing the details of a randomly selected cold menu item,
              including its ID, name, and price.
    """
    query = text('''SELECT Menu.id, Menu.itemName, Menu.price
        FROM Menu
        JOIN MIJunc ON Menu.id = MIJunc.menuID
        JOIN Inventory ON MIJunc.itemID = Inventory.id
        WHERE Inventory.name IN ('Spice', 'Hot Dog', 'Chicken');'''
    )
    result = db.session.execute(query).fetchall()
    menu_items = [{"id": row[0], "itemName": row[1], "price": row[2]} for row in result]

    random_menu_item = random.choice(menu_items)

    return random_menu_item

def get_warm_inventory():
    """
    Retrieves a random menu item categorized as warm from the database.

    Returns:
        dict: A dictionary containing the details of a randomly selected warm menu item,
              including its ID, name, and price.
    """
    query = text('''SELECT Menu.id, Menu.itemName, Menu.price
        FROM Menu
        JOIN MIJunc ON Menu.id = MIJunc.menuID
        JOIN Inventory ON MIJunc.itemID = Inventory.id
        WHERE Inventory.name IN ('Bacon', 'Cheese');'''
    )
    result = db.session.execute(query).fetchall()
    menu_items = [{"id": row[0], "itemName": row[1], "price": row[2]} for row in result]

    random_menu_item = random.choice(menu_items)

    return random_menu_item


@app.route('/api/recommended')
def get_recommended_item():
    """
    Recommends a menu item based on the current temperature.

    This function checks the current temperature and recommends a menu item 
    categorized as hot if the temperature is 80°F or higher, a cold item if 
    the temperature is below 60°F, and a warm item otherwise.

    Returns:
        dict: A JSON object containing the recommended menu item. 
            
              
    """
    temp = get_temp()
    # if temp = "Error ..."
    if (float(temp) >= 80):
        hot_item = get_hot_inventory()
        return jsonify({"item": hot_item})
    elif (float(temp) < 60):
        cold_item = get_cold_inventory()
        return jsonify({"item": cold_item})
    else:
        warm_item = get_warm_inventory()
        return jsonify({"item": warm_item})




if __name__ == '__main__':
    app.run(debug=True)
