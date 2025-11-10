
import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

export default function ProductItem({ item, onEdit, onDelete }) {
  return (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.nombre}</Text>
        <Text>Precio: S/. {Number(item.precio).toFixed(2)}</Text>
        <Text>Stock: {item.stock}</Text>
        <Text>Categoría: {item.categoria}</Text>
      </View>
      <View style={styles.buttons}>
        <Button title="Editar" onPress={() => onEdit(item)} />
        <View style={{ height: 8 }} />
        <Button color="#cc0000" title="Eliminar" onPress={() => onDelete(item.id)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 8,
    backgroundColor: "#f9f9f9",
  },
  title: { fontSize: 16, fontWeight: "700" },
  buttons: { justifyContent: "center", marginLeft: 12 },
});
