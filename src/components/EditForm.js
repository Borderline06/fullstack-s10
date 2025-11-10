
import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet } from "react-native";

export default function EditForm({ product, onCancel, onSave }) {
  const [nombre, setNombre] = useState(product.nombre + "");
  const [precio, setPrecio] = useState(String(product.precio));
  const [stock, setStock] = useState(String(product.stock));
  const [categoria, setCategoria] = useState(product.categoria || "");

  return (
    <View>
      <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Nombre" />
      <TextInput style={styles.input} value={precio} onChangeText={setPrecio} keyboardType="numeric" placeholder="Precio" />
      <TextInput style={styles.input} value={stock} onChangeText={setStock} keyboardType="numeric" placeholder="Stock" />
      <TextInput style={styles.input} value={categoria} onChangeText={setCategoria} placeholder="Categoría" />
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
        <Button title="Cancelar" onPress={onCancel} />
        <Button title="Guardar" onPress={() => onSave({ id: product.id, nombre, precio, stock, categoria })} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
});
