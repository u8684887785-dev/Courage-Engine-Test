import bpy
import json
import os

class HTMLToOBJ:
    def __init__(self, json_data):
        self.json_data = json_data

    def create_object(self):
        mesh_data = bpy.data.meshes.new(self.json_data['name'])
        mesh_object = bpy.data.objects.new(self.json_data['name'], mesh_data)

        bpy.context.collection.objects.link(mesh_object)
        bpy.context.view_layer.objects.active = mesh_object
        mesh_data.from_pydata(self.json_data['vertices'], [], self.json_data['faces'])
        mesh_data.update()

    @classmethod
    def from_file(cls, file_path):
        with open(file_path, 'r') as file:
            data = json.load(file)
        return cls(data)

if __name__ == '__main__':
    # Path to the exported JSON file from Three.js
    file_path = os.path.join(bpy.path.abspath('//'), 'exported_scene.json')
    obj_converter = HTMLToOBJ.from_file(file_path)
    obj_converter.create_object()