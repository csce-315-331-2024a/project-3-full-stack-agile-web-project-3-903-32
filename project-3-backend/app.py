from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text, select
import os
from dotenv import load_dotenv
from flask_cors import CORS

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
    
@app.route('/api/inventory')
def get_inventory_items():
    query = text("SELECT name, stock, location, capacity, supplier, minimum FROM Inventory")
    results = db.session.execute(query).fetchall()
    print(results)
    if results:
        data = []
        for row in results:
            item = {
                'name' : row[0],
                'stock' : row[1],
                'location' : row[2],
                'capacity' : row[3],
                'supplier' : row[4],
                'minimum' : row[5]
            }
            print(row[0])
            print(row[1])
            print(row[2])
            print(row[3])
            print(row[4])
            print(row[5])
            data.append(item)

        return jsonify(data)
    else:
        return jsonify({'error': 'No data found'}), 404

if __name__ == '__main__':
    app.run(debug=True, port=5000)
