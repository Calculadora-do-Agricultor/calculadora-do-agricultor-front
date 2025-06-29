import { db } from "./firebaseConfig";
import { authWrapper } from "./firebaseWrapper";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  deleteDoc,
  doc,
  Timestamp
} from "firebase/firestore";

/**
 * Service for managing user calculation history in Firestore
 */
export class CalculationHistoryService {
  /**
   * Save a calculation to user's history
   * @param {string} calculationId - Unique ID of the calculation type
   * @param {Object} parametersUsed - Key-value pairs of parameter IDs and values
   * @param {Object} results - Key-value pairs of result IDs and values
   * @param {string} title - User-defined title for the calculation
   * @returns {Promise<string>} - Document ID of the saved history entry
   */
  static async saveCalculationHistory(calculationId, parametersUsed, results, title) {
    try {
      const currentUser = authWrapper.getCurrentUser();
      if (!currentUser) {
        throw new Error("User must be authenticated to save calculation history");
      }

      const historyData = {
        calculationId,
        title: title || `Cálculo - ${new Date().toLocaleDateString('pt-BR')}`,
        timestamp: serverTimestamp(),
        parametersUsed,
        results,
        userId: currentUser.uid
      };

      const historyRef = collection(db, "users", currentUser.uid, "calculationHistory");
      const docRef = await addDoc(historyRef, historyData);
      
      console.log("Calculation history saved with ID:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Error saving calculation history:", error);
      throw error;
    }
  }

  /**
   * Get user's calculation history with pagination
   * @param {number} limitCount - Number of records to fetch (default: 50)
   * @param {string} calculationId - Optional filter by calculation type
   * @returns {Promise<Array>} - Array of history entries
   */
  static async getCalculationHistory(limitCount = 50, calculationId = null) {
    try {
      const currentUser = authWrapper.getCurrentUser();
      if (!currentUser) {
        throw new Error("User must be authenticated to access calculation history");
      }

      const historyRef = collection(db, "users", currentUser.uid, "calculationHistory");
      let historyQuery = query(
        historyRef,
        orderBy("timestamp", "desc"),
        limit(limitCount)
      );

      if (calculationId) {
        historyQuery = query(
          historyRef,
          where("calculationId", "==", calculationId),
          orderBy("timestamp", "desc"),
          limit(limitCount)
        );
      }

      const querySnapshot = await getDocs(historyQuery);
      const historyEntries = [];
      
      querySnapshot.forEach((doc) => {
        historyEntries.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return historyEntries;
    } catch (error) {
      console.error("Error fetching calculation history:", error);
      throw error;
    }
  }

  /**
   * Clean old calculation history entries (older than specified days)
   * @param {number} daysToKeep - Number of days to keep history (default: 90)
   * @returns {Promise<number>} - Number of deleted entries
   */
  static async cleanOldHistory(daysToKeep = 90) {
    try {
      const currentUser = authWrapper.getCurrentUser();
      if (!currentUser) {
        throw new Error("User must be authenticated to clean calculation history");
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const historyRef = collection(db, "users", currentUser.uid, "calculationHistory");
      const oldEntriesQuery = query(
        historyRef,
        where("timestamp", "<", cutoffDate),
        orderBy("timestamp", "asc")
      );

      const querySnapshot = await getDocs(oldEntriesQuery);
      let deletedCount = 0;

      // Delete entries in batches to avoid hitting Firestore limits
      const deletePromises = [];
      querySnapshot.forEach((docSnapshot) => {
        const docRef = doc(db, "users", currentUser.uid, "calculationHistory", docSnapshot.id);
        deletePromises.push(deleteDoc(docRef));
        deletedCount++;
      });

      await Promise.all(deletePromises);
      
      console.log(`Cleaned ${deletedCount} old calculation history entries`);
      return deletedCount;
    } catch (error) {
      console.error("Error cleaning old calculation history:", error);
      throw error;
    }
  }

  /**
   * Delete a specific calculation history entry
   * @param {string} historyId - ID of the history entry to delete
   * @returns {Promise<void>}
   */
  static async deleteCalculationHistory(historyId) {
    try {
      const currentUser = authWrapper.getCurrentUser();
      if (!currentUser) {
        throw new Error("User must be authenticated to delete calculation history");
      }

      const docRef = doc(db, "users", currentUser.uid, "calculationHistory", historyId);
      await deleteDoc(docRef);
      
      console.log("Calculation history deleted with ID:", historyId);
    } catch (error) {
      console.error("Error deleting calculation history:", error);
      throw error;
    }
  }

  /**
   * Transform calculation data to history format with stable IDs
   * @param {Object} calculation - Calculation object
   * @param {Object} paramValues - Parameter values from form
   * @param {Object} results - Calculated results
   * @returns {Object} - Formatted data for history storage
   */
  static transformToHistoryFormat(calculation, paramValues, results) {
    const parametersUsed = {};
    const resultsFormatted = {};

    // Transform parameters using their IDs
    if (calculation.parameters) {
      calculation.parameters.forEach((param) => {
        if (paramValues[param.name] !== undefined && paramValues[param.name] !== "") {
          const paramId = param.id || `param_${param.name.toLowerCase().replace(/\s+/g, '_')}`;
          parametersUsed[paramId] = paramValues[param.name];
        }
      });
    }

    // Transform results using their IDs
    if (calculation.results && calculation.results.length > 0) {
      // New format: multiple results
      calculation.results.forEach((result, index) => {
        const resultKey = `result_${index}`;
        const resultId = result.id || `res_${result.name.toLowerCase().replace(/\s+/g, '_')}`;
        
        if (results[resultKey]) {
          const resultData = results[resultKey];
          resultsFormatted[resultId] = typeof resultData === 'object' ? resultData.value : resultData;
        }
      });
    } else {
      // Legacy format: single main result
      const mainResultId = calculation.resultId || 'res_main_result';
      resultsFormatted[mainResultId] = results.value || "0";
      
      // Additional results
      if (calculation.additionalResults) {
        calculation.additionalResults.forEach((result) => {
          const resultId = result.id || `res_${result.key}`;
          resultsFormatted[resultId] = results[result.key] || "0";
        });
      }
    }

    return {
      parametersUsed,
      results: resultsFormatted
    };
  }
}

export default CalculationHistoryService;