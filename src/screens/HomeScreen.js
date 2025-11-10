
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Alert,
  Modal,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  initDB,
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
} from "../db/db";
import ProductItem from "../components/ProductItem";
import EditForm from "../components/EditForm";

export default function HomeScreen() {
  const [productos, setProductos] = useState([]);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("0");
  const [categoria, setCategoria] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        await initDB();
        await refreshProducts();
      } catch (err) {
        Alert.alert("Error", "No se pudo inicializar la base de datos.");
        console.log(err);
      }
    })();
  }, []);

  async function refreshProducts() {
    setLoading(true);
    try {
      const rows = await getAllProducts();
      setProductos(rows);
    } catch (err) {
      console.log("refresh err", err);
      Alert.alert("Error", "No se pudo leer productos.");
    } finally {
      setLoading(false);
    }
  }

  async function onAdd() {
    if (!nombre.trim()) return Alert.alert("Validación", "El nombre es obligatorio.");
    if (!precio.trim() || isNaN(precio)) return Alert.alert("Validación", "El precio debe ser numérico.");

    try {
      await addProduct({
        nombre: nombre.trim(),
        precio: Number(precio),
        stock: parseInt(stock) || 0,
        categoria: categoria.trim() || "General",
      });
      Alert.alert("Éxito", "Producto agregado.");
      setNombre("");
      setPrecio("");
      setStock("0");
      setCategoria("");
      await refreshProducts();
    } catch (err) {
      console.log("add err", err);
      Alert.alert("Error", "No se pudo agregar.");
    }
  }

  function onEdit(item) {
    setEditingProduct(item);
    setModalVisible(true);
  }

  async function onSaveEdit(updated) {
    if (!updated.nombre.trim()) return Alert.alert("Validación", "Nombre no puede estar vacío.");
    if (!updated.precio || isNaN(updated.precio)) return Alert.alert("Validación", "Precio inválido.");

    try {
      await updateProduct(updated.id, {
        nombre: updated.nombre.trim(),
        precio: Number(updated.precio),
        stock: parseInt(updated.stock) || 0,
        categoria: updated.categoria.trim() || "General",
      });
      Alert.alert("Éxito", "Producto actualizado.");
      setModalVisible(false);
      setEditingProduct(null);
      await refreshProducts();
    } catch (err) {
      console.log("update err", err);
      Alert.alert("Error", "No se pudo actualizar.");
    }
  }

  function onDelete(id) {
    Alert.alert("Confirmar", "¿Eliminar producto?", [
      { text: "Cancelar" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteProduct(id);
            await refreshProducts();
            Alert.alert("Éxito", "Producto eliminado.");
          } catch (err) {
            console.log("delete err", err);
            Alert.alert("Error", "No se pudo eliminar.");
          }
        },
      },
    ]);
  }

  async function onFilter() {
    if (!filterCategoria.trim()) {
      await refreshProducts();
      return;
    }
    try {
      const rows = await getProductsByCategory(filterCategoria.trim());
      setProductos(rows);
    } catch (err) {
      console.log("filter err", err);
      Alert.alert("Error", "No se pudo filtrar.");
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.header}>Laboratorio Semana 10 — CRUD (Expo + SQLite)</Text>

        <Text style={styles.section}>Agregar producto</Text>
        <TextInput placeholder="Nombre" value={nombre} onChangeText={setNombre} style={styles.input} />
        <TextInput placeholder="Precio" value={precio} onChangeText={setPrecio} keyboardType="numeric" style={styles.input} />
        <TextInput placeholder="Stock" value={stock} onChangeText={setStock} keyboardType="numeric" style={styles.input} />
        <TextInput placeholder="Categoría" value={categoria} onChangeText={setCategoria} style={styles.input} />
        <Button title="Agregar" onPress={onAdd} />

        <View style={{ height: 16 }} />

        <Text style={styles.section}>Filtrar por categoría</Text>
        <TextInput
          placeholder="Ejemplo: Electrónica"
          value={filterCategoria}
          onChangeText={setFilterCategoria}
          style={styles.input}
        />
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Button title="Filtrar" onPress={onFilter} />
          <Button title="Mostrar todo" onPress={refreshProducts} />
        </View>

        <Text style={[styles.section, { marginTop: 12 }]}>Lista de productos</Text>

        {loading ? <Text>Cargando...</Text> : (
          productos.length === 0 ? <Text>No hay productos.</Text> : (
            <FlatList
              data={productos}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => <ProductItem item={item} onEdit={onEdit} onDelete={onDelete} />}
              scrollEnabled={false}
            />
          )
        )}

        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {editingProduct && <EditForm product={editingProduct} onCancel={() => setModalVisible(false)} onSave={onSaveEdit} />}
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { fontSize: 18, fontWeight: "bold", marginBottom: 12, textAlign: "center" },
  section: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
  },
});
