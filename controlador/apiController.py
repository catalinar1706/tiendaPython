from app import app, productos
from flask import request, jsonify, redirect,render_template, session, Response
import pymongo
import os
import pymongo.errors
from bson import json_util,ObjectId
import json


@app.route("/listarProductos")
def inicio():
    if("user" in session):
        return render_template("listarProductos.html")
    else:
        mensaje="Debe primero ingresar con sus credenciales"
        return render_template("frmLogin.html", mensaje=mensaje)

@app.route("/api/agregar", methods=['POST'])
def apiAgregar():    
    codigo = int(request.json['codigo'])          
    nombre = request.json['nombre']
    precio = int(request.json['precio'])
    categoria = request.json['categoria']
    foto = request.json['foto']
    
    p = {   "codigo": codigo, "nombre": nombre, "precio": precio, 
            "categoria": categoria, "foto": foto
        }  
    existe = existeProducto(codigo)
    if (not existe):   
        respuesta = productos.insert_one (p)    
        if(respuesta.acknowledged):
            mensaje=f"Producto Agregado Correctamente"                
        else:
            mensaje="Problemas al agregar el producto."   
    else:
        mensaje=f"Ya existe un producto con el código {codigo}" 
        
    retorno = {"mensaje":mensaje}
    return jsonify(retorno)

@app.route("/api/listarProductos", methods=['GET'])
def apiListarProductos():
    data = productos.find()
    resultado = json_util.dumps(data)
    #return Response(resultado,mimetype='application/json')
    return jsonify(resultado)
    

@app.route("/api/consultar/<id>",methods=['GET'])
def apiConsultarPorId(id):
    data = productos.find_one({'_id':ObjectId(id)})
    if(data):
        resultado = json_util.dumps(data)
    else:
        resultado="Producto no existe con ese código"
    return Response(resultado,mimetype='application/json')
     

@app.route("/api/actualizar/<id>", methods=['PUT'])
def apiActualizar(id):
    mensaje=None
    data = request.get_json()
    respuesta = productos.update_one({'_id':ObjectId(id)},{'$set':data})
    if respuesta.modified_count >=1:
        resultado='Producto actualizado correctamente'
    else:
        resultado='Producto no encontrado'
        
    return Response(resultado,mimetype='application/json')
    
@app.route('/api/eliminar/<id>', methods = ['DELETE'])
def apiEliminar(id):
    respuesta = productos.delete_one({'_id':ObjectId(id)})
    if respuesta.deleted_count >=1:
        return 'Producto eliminado correctamente', 200
    else:
        return 'Producto no encontrado', 404
    
    
def existeProducto(codigo):    
    try:
        consulta = {"codigo":codigo}    
        producto = productos.find_one(consulta)
        if(producto is not None):
            return True
        else:
            return False        
    except pymongo.errors as error:
        print(error)
        return False