
import { Platform } from "react-native";
import * as SQLite from "expo-sqlite";


let db = null;

if (Platform.OS !== "web") {
  db = SQLite.openDatabase("tienda.db");
} else {
  console.warn("SQLite no está disponible en Web. Se usa un mock temporal.");
  db = {
    transaction: (callback) => {
      const tx = {
        executeSql: (sql, params, success) => {
          console.log("Mock SQL (web):", sql, params);
          if (success) success(tx, { rows: { _array: [] } });
        },
      };
      callback(tx);
    },
  };
}

// ======================
// Funciones CRUD (Expo SDK actual)
// ======================

export function initDB(callback = () => {}) {
  db.transaction((tx) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS productos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        precio REAL NOT NULL,
        stock INTEGER DEFAULT 0,
        categoria TEXT DEFAULT 'General'
      );`
    );

    // Insertar 2 registros si está vacía
    tx.executeSql(
      `SELECT COUNT(*) as count FROM productos;`,
      [],
      (_, { rows }) => {
        const count = rows._array[0].count;
        if (count === 0) {
          tx.executeSql(
            `INSERT INTO productos (nombre, precio, stock, categoria)
             VALUES (?, ?, ?, ?), (?, ?, ?, ?);`,
            ["Laptop", 3500.0, 10, "Electrónica", "Camiseta", 50.0, 20, "Ropa"]
          );
        }
      }
    );
  },
  (err) => callback(err),
  () => callback(null));
}

export function getAllProducts(setter) {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT * FROM productos ORDER BY id DESC;",
      [],
      (_, { rows }) => setter(rows._array)
    );
  });
}

export function addProduct(data, success, error) {
  const { nombre, precio, stock, categoria } = data;
  db.transaction((tx) => {
    tx.executeSql(
      "INSERT INTO productos (nombre, precio, stock, categoria) VALUES (?,?,?,?);",
      [nombre, precio, stock, categoria],
      () => success(),
      (_, err) => {
        error(err);
        return true;
      }
    );
  });
}

export function updateProduct(id, data, success, error) {
  const { nombre, precio, stock, categoria } = data;
  db.transaction((tx) => {
    tx.executeSql(
      "UPDATE productos SET nombre=?, precio=?, stock=?, categoria=? WHERE id=?;",
      [nombre, precio, stock, categoria, id],
      () => success(),
      (_, err) => {
        error(err);
        return true;
      }
    );
  });
}

export function deleteProduct(id, success, error) {
  db.transaction((tx) => {
    tx.executeSql(
      "DELETE FROM productos WHERE id=?;",
      [id],
      () => success(),
      (_, err) => {
        error(err);
        return true;
      }
    );
  });
}

export function getProductsByCategory(categoria, setter) {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT * FROM productos WHERE categoria = ? ORDER BY id DESC;",
      [categoria],
      (_, { rows }) => setter(rows._array)
    );
  });
}
