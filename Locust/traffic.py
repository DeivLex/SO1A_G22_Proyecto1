from locust import HttpUser, task, between
import json
import random
import sys

class Reader():
    def __init__(self):
        self.file_path = "traffic.json"
        self.lista_datos = []
        self.lista_leidos = []
        self.indice_obtenido = 0
        self.obtenido = False

    def obtener_index(self):
        length = len(self.lista_datos)
        for x in range(length):
            self.indice_obtenido = x
            if self.existe_index() is None:
                return self.lista_datos[x]
        return None       

    def existe_index(self):
        for x in self.lista_leidos:
            if x == self.indice_obtenido:
                return x
        self.lista_leidos.append(self.indice_obtenido)
        return None
            
    def load(self):
        print ("Cargando datos...")
        try:
            with open("traffic.json", 'r') as data_file:
                self.lista_datos = json.loads(data_file.read())

        except Exception as e:
            print (f'>> error, {e}')

class MessageTraffic(HttpUser):
    wait_time = between(0.2, 0.9)
    reader = Reader()
     
    def on_start(self):
        if self.reader.obtenido == False:
            self.reader.load()
            self.reader.obtenido = True
        print ("Mandando datos...")
        print("\n")
        
    @task
    def PostMessage(self):
        random_data = self.reader.obtener_index()
        if (random_data is not None):
            self.client.post("/", json=random_data)
        else:
            print("Se envio correctamente.")
            self.stop(True)