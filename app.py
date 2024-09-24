from flask import Flask
import pymongo
from flask_cors import CORS
#crear objeto de tipo flask
app = Flask(__name__)
CORS(app)

#secrret key
app.secret_key="sdsadasd233242"

#crear configurtación de carpeta donde se van a guardar las imagenes
app.config['UPLOAD_FOLDER']='./static/imagenes'

#crear el objeto que se conecta a la base de datos
miConexion = pymongo.MongoClient("mongodb://localhost:27017")

#crear un objeto que representa la base de datos de mongo
baseDatos = miConexion['Tienda']

#crear un objeto que representa la colección de la base de datos
productos = baseDatos['Productos']

#crear objeto que representa la colección usuarios
usuarios = baseDatos['Usuarios']

if __name__=="__main__":
    from controlador.productoController import *
    from controlador.usuarioController import * 
    #arrancar el servidor en el pueerto 8000
    app.run(port=8000,debug=True)
    
    
