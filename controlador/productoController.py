from app import app, productos
from flask import request, jsonify, redirect,render_template, session
import pymongo
import os
import pymongo.errors
from werkzeug.utils import secure_filename
from bson.objectid import ObjectId
import json


@app.route("/listarProductos")
def inicio():
    if("user" in session):
        try:
            mensaje=""
            listaProductos = productos.find()
        except pymongo.errors as error:
            mensaje=str(error)
            
        return render_template("listarProductos.html", productos=listaProductos, mensaje=mensaje)
    else:
        mensaje="Debe primero ingresar con sus credenciales"
        return render_template("frmLogin.html", mensaje=mensaje)
    
@app.route("/agregar", methods=['POST', 'GET'])
def agregar():
    if("user" in session):
        if(request.method=='POST'):
            try:
                producto=None
                codigo = int(request.form['txtCodigo'])          
                nombre = request.form['txtNombre']
                precio = int(request.form['txtPrecio'])
                categoria = request.form['cbCategoria']
                foto = request.files['fileFoto']
                nombreArchivo = secure_filename(foto.filename)
                listaNombreArchivo = nombreArchivo.rsplit(".",1)
                extension = listaNombreArchivo[1].lower()
                #nombre de la foto se compone del código y la extensión
                nombreFoto = f"{codigo}.{extension}"        
                producto = {
                    "codigo": codigo, "nombre": nombre, "precio": precio, 
                    "categoria": categoria, "foto": nombreFoto
                }  
                #verificar si ya existe un producto con ese código
                existe = existeProducto(codigo) # se llama a la función
                if (not existe):   
                    resultado = productos.insert_one(producto)
                    if(resultado.acknowledged):
                        mensaje="Producto Agregado Correctamente" 
                        foto.save(os.path.join(app.config["UPLOAD_FOLDER"],nombreFoto))
                        return redirect('/listarProductos') # se redirecciona a la ruta raiz
                    else:
                        mensaje="Problemas al agregar el producto."   
                else:
                    mensaje="Ya existe un producto con ese código" 
            except pymongo.errors as error:
                mensaje=error         
            return render_template("frmAgregarProducto.html",mensaje=mensaje, producto=producto )
        else:
            if(request.method=='GET'):
                producto=None
                return render_template("frmAgregarProducto.html", producto=producto)
    else:
        mensaje="Debe primero ingresar con sus credenciales"
        return render_template("frmLogin.html", mensaje=mensaje) 
       
@app.route("/consultar/<string:id>", methods=["GET"])
def consultar(id):
    if("user" in session):
        if(request.method=='GET'):
            try:
                id=ObjectId(id)
                consulta = {"_id":id}
                producto = productos.find_one(consulta)        
                return render_template("frmActualizarProducto.html",producto=producto)
            except pymongo.errors as error:
                mensaje=error
                return redirect("/listarProductos")
    else:
        mensaje="Debe primero ingresar con sus credenciales"
        return render_template("frmLogin.html", mensaje=mensaje)
        
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
    
    
@app.route("/actualizar",methods=["POST"])        
def actualizarProducto():
    if("user" in session):
        try:    
            if(request.method=="POST"):
                #recibir los valores de la vista en variables locales
                codigo=int(request.form["txtCodigo"])
                nombre=request.form["txtNombre"]
                precio=int(request.form["txtPrecio"])
                categoria=request.form["cbCategoria"]   
                id=ObjectId(request.form["id"])     
                #verificar si viene foto para actualizarla
                foto = request.files["fileFoto"]
                if(foto.filename!=""):
                    nombreArchivo = secure_filename(foto.filename)           
                    listaNombreArchivo = nombreArchivo.rsplit(".",1)
                    extension = listaNombreArchivo[1].lower()
                    nombreFoto = f"{codigo}.{extension}"       
                    producto = {
                        "_id": id, "codigo":codigo,"nombre":nombre,
                        "precio":precio,"categoria":categoria,"foto": nombreFoto      
                    }
                else:
                    producto = {
                        "_id":id, "codigo":codigo, "nombre":nombre,
                        "precio":precio, "categoria":categoria       
                    }                    
                criterio = {"_id":id} 
                consulta = {"$set": producto}
                #verificar si el nuevo código ya existe de un producto diferente a sí mismo
                existe = productos.find_one({"codigo": codigo, "_id":{"$ne": id}})
                if existe:
                    mensaje="Producto ya existe con ese código"
                    return render_template("frmActualizarProducto.html", producto=producto, mensaje=mensaje)
                else:
                    resultado=productos.update_one(criterio,consulta)
                    if(resultado.acknowledged):
                        mensaje="Producto Actualizado"    
                        if(foto.filename!=""):                  
                            foto.save(os.path.join(app.config["UPLOAD_FOLDER"],nombreFoto)) 
                        return redirect("/listarProductos")      
        except pymongo.errors as error:
            mensaje=error
            return redirect("/listarProductos")
    else:
        mensaje="Debe primero ingresar con sus credenciales"
        return render_template("frmLogin.html", mensaje=mensaje)
    
@app.route("/eliminar/<string:id>")
def eliminar(id):
    if("user" in session):
        try:
            id = ObjectId(id)
            criterio = {"_id":id}
            producto = productos.find_one(criterio)
            print(producto)
            nombreFoto = producto['foto']
            resultado = productos.delete_one(criterio)
            if(resultado.acknowledged):
                mensaje="Producto Eliminado" 
                if nombreFoto != "":
                    rutaFoto= app.config['UPLOAD_FOLDER']+"/"+nombreFoto
                    if (os.path.exists(rutaFoto)):
                        os.remove(rutaFoto) 
        except pymongo.errors as error:
            mensaje=str(error)        
        return redirect("/listarProductos") 
    else:
        mensaje="Debe primero ingresar con sus credenciales"
        return render_template("frmLogin.html", mensaje=mensaje)     
        
        
    
@app.route("/api/listarProductos",methods=["GET"])
def apiListarProductos():
    listaProductos=productos.find()
    lista=[]
    for p in listaProductos:       
        producto={
            "_id": str(p['_id']),
            "codigo":p['codigo'],
            "nombre": p['nombre'],
            "precio": p['precio'],
            "categoria": p['categoria'],
            "foto": p['foto']
        }
        
        lista.append(producto)        
    retorno = {'productos': lista}
    return jsonify(retorno)

@app.route("/api/consultar/<string:id>",methods=["GET"])
def apiConsultar(id):
    consulta = {"_id":ObjectId(id)}
    p = productos.find_one(consulta) 
    producto={
            "_id": str(p['_id']),
            "codigo":p['codigo'],
            "nombre": p['nombre'],
            "precio": p['precio'],
            "categoria": p['categoria'],
            "foto": p['foto']
        }
    retorno = {'producto': producto}
    return jsonify(retorno)

@app.route("/api/agregar",methods=["POST"])
def apiAgregarP():    
    try:
        p=None
        mensaje=""
        codigo = int(request.json['codigo'])          
        nombre = request.json['nombre']
        precio = int(request.json['precio'])
        categoria = request.json['categoria']
        foto = request.json['foto']
        p = {
                "codigo": codigo, "nombre": nombre, "precio": precio, 
                "categoria": categoria, "foto": foto
        }  
        existe = existeProducto(codigo) # se llama a la función
        if (not existe):   
            resultado = productos.insert_one(p)
            if(resultado.acknowledged):
                mensaje=f"Producto Agregado Correctamente"                
            else:
                mensaje="Problemas al agregar el producto."   
        else:
            mensaje=f"Ya existe un producto con el código {codigo}" 
            
    except pymongo.errors as error:
        mensaje = str(error)
    
  
    retorno = {"mensaje":mensaje}
    return jsonify(retorno)
