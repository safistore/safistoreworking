// ==========================================================================
// SafiStore - Firebase Firestore Bridge (v8 Compat SDK)
// Works over file:// protocol without CORS errors and handles offline modes
// ==========================================================================

// User's Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDqDVIXo50D7rtTploSCyGWQG0kbiszsmw",
  authDomain: "safistore-v3.firebaseapp.com",
  projectId: "safistore-v3",
  storageBucket: "safistore-v3.firebasestorage.app",
  messagingSenderId: "734794260459",
  appId: "1:734794260459:web:f8ce2666973ee2e47c83ae",
  measurementId: "G-27GFC2K4NY"
};

// Initialize Firebase only if the SDK was loaded successfully
let db;
let firebaseLoaded = false;

if (typeof firebase !== 'undefined') {
  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    db = firebase.firestore();
    firebaseLoaded = true;
    console.log("Firebase SDK initialized successfully.");
  } catch (err) {
    console.error("Firebase SDK failed to initialize:", err);
  }
} else {
  console.warn("Firebase SDK not loaded. Running in local offline mode.");
}

// Expose API globally
window.firebaseDb = {
  /**
   * Checks if Firebase connection is active and database is ready.
   */
  isLive() {
    return firebaseLoaded && typeof db !== 'undefined';
  },

  /**
   * Loads products from Firestore.
   * If empty, seeds the database with fallback products.
   */
  async loadProducts(mockProducts) {
    if (!this.isLive()) {
      console.warn("Firebase is offline. Loading local backup database.");
      return mockProducts;
    }
    try {
      const snapshot = await db.collection("products").get();
      
      if (snapshot.empty) {
        console.log("Firestore products collection is empty. Seeding mock data...");
        await this.seedDatabase(mockProducts);
        // Re-fetch after seeding
        const seededSnapshot = await db.collection("products").get();
        return seededSnapshot.docs.map(doc => doc.data());
      }
      
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error("Error loading products from Firebase:", error);
      // Fallback to local mock products on failure
      return mockProducts;
    }
  },

  /**
   * Seeds database.
   */
  async seedDatabase(mockProducts) {
    if (!this.isLive()) return;
    try {
      const batch = db.batch();
      mockProducts.forEach(prod => {
        const docRef = db.collection("products").doc(prod.id);
        batch.set(docRef, prod);
      });
      await batch.commit();
      console.log("Database seeded successfully!");
    } catch (err) {
      console.error("Seeding database failed:", err);
      throw err;
    }
  },

  /**
   * Adds a new product document to Firestore.
   */
  async addProduct(productData) {
    if (!this.isLive()) {
      throw new Error("Firebase database offline.");
    }
    try {
      const docRef = db.collection("products").doc(productData.id);
      await docRef.set(productData);
      console.log("Product added to Firestore:", productData.id);
      return productData;
    } catch (error) {
      console.error("Error adding product to Firestore:", error);
      throw error;
    }
  },

  /**
   * Deletes a product document from Firestore.
   */
  async deleteProduct(productId) {
    if (!this.isLive()) {
      throw new Error("Firebase database offline.");
    }
    try {
      await db.collection("products").doc(productId).delete();
      console.log("Product deleted from Firestore:", productId);
    } catch (error) {
      console.error("Error deleting product from Firestore:", error);
      throw error;
    }
  },

  /**
   * Saves an order document to Firestore.
   */
  async saveOrder(orderData) {
    if (!this.isLive()) {
      throw new Error("Firebase database offline.");
    }
    try {
      const docRef = await db.collection("orders").add({
        ...orderData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      console.log("Order saved to Firestore with ID:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Error saving order to Firestore:", error);
      throw error;
    }
  },

  /**
   * Adds a customer review to a product document.
   */
  async addReview(productId, reviewObj) {
    if (!this.isLive()) {
      throw new Error("Firebase database offline.");
    }
    try {
      const docRef = db.collection("products").doc(productId);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        throw new Error(`Product ${productId} does not exist.`);
      }

      const product = docSnap.data();
      if (!product.reviews) product.reviews = [];
      product.reviews.unshift(reviewObj);

      // Recalculate averages
      const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
      product.rating = totalRating / product.reviews.length;
      product.reviewsCount = product.reviews.length;

      await docRef.update({
        reviews: product.reviews,
        rating: product.rating,
        reviewsCount: product.reviewsCount
      });

      return product;
    } catch (error) {
      console.error("Error adding review to Firestore:", error);
      throw error;
    }
  }
};
