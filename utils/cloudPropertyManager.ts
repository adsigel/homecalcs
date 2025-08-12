import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  getDocs, 
  deleteDoc,
  onSnapshot,
  writeBatch
} from 'firebase/firestore'
import { db, getCurrentUserId } from './firebase'
import { PropertiesCollection, Property } from '../types/property'

const COLLECTION_NAME = 'properties'

// Check if user is authenticated
export const isUserAuthenticated = (): boolean => {
  return !!getCurrentUserId()
}

// Save properties collection to Firestore
export const savePropertiesCollection = async (propertiesCollection: PropertiesCollection): Promise<boolean> => {
  try {
    const userId = getCurrentUserId()
    if (!userId) {
      console.error('No user ID available')
      return false
    }

    const docRef = doc(db, 'users', userId, COLLECTION_NAME, 'collection')
    await setDoc(docRef, propertiesCollection)
    return true
  } catch (error) {
    console.error('Failed to save properties collection:', error)
    return false
  }
}

// Load properties collection from Firestore
export const loadPropertiesCollection = async (): Promise<PropertiesCollection | null> => {
  try {
    const userId = getCurrentUserId()
    if (!userId) {
      console.error('No user ID available')
      return null
    }

    const docRef = doc(db, 'users', userId, COLLECTION_NAME, 'collection')
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return docSnap.data() as PropertiesCollection
    } else {
      // Return default empty collection if none exists
      return {
        properties: [],
        activePropertyId: null,
        lastUpdated: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error('Failed to load properties collection:', error)
    return null
  }
}

// Real-time listener for properties collection changes
export const subscribeToPropertiesCollection = (
  callback: (propertiesCollection: PropertiesCollection | null) => void
) => {
  const userId = getCurrentUserId()
  if (!userId) {
    callback(null)
    return () => {}
  }

  const docRef = doc(db, 'users', userId, COLLECTION_NAME, 'collection')
  
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data() as PropertiesCollection)
    } else {
      // Return default empty collection if none exists
      callback({
        properties: [],
        activePropertyId: null,
        lastUpdated: new Date().toISOString()
      })
    }
  }, (error) => {
    console.error('Error listening to properties collection:', error)
    callback(null)
  })
}

// Delete a specific property
export const deleteProperty = async (propertyId: string): Promise<boolean> => {
  try {
    const userId = getCurrentUserId()
    if (!userId) {
      console.error('No user ID available')
      return false
    }

    // Load current collection
    const currentCollection = await loadPropertiesCollection()
    if (!currentCollection) return false

    // Remove the property
    const updatedProperties = currentCollection.properties.filter(p => p.id !== propertyId)
    
    // Update active property if needed
    let updatedActivePropertyId = currentCollection.activePropertyId
    if (currentCollection.activePropertyId === propertyId) {
      updatedActivePropertyId = updatedProperties.length > 0 ? updatedProperties[0].id : null
    }

    // Save updated collection
    const updatedCollection: PropertiesCollection = {
      ...currentCollection,
      properties: updatedProperties,
      activePropertyId: updatedActivePropertyId,
      lastUpdated: new Date().toISOString()
    }

    return await savePropertiesCollection(updatedCollection)
  } catch (error) {
    console.error('Failed to delete property:', error)
    return false
  }
}

// Update a specific property
export const updateProperty = async (propertyId: string, updates: Partial<Property>): Promise<boolean> => {
  try {
    const userId = getCurrentUserId()
    if (!userId) {
      console.error('No user ID available')
      return false
    }

    // Load current collection
    const currentCollection = await loadPropertiesCollection()
    if (!currentCollection) return false

    // Find and update the property
    const updatedProperties = currentCollection.properties.map(p => 
      p.id === propertyId ? { ...p, ...updates } as Property : p
    )

    // Save updated collection
    const updatedCollection: PropertiesCollection = {
      ...currentCollection,
      properties: updatedProperties,
      lastUpdated: new Date().toISOString()
    }

    return await savePropertiesCollection(updatedCollection)
  } catch (error) {
    console.error('Failed to update property:', error)
    return false
  }
}

// Check if cloud storage is available
export const isCloudStorageAvailable = (): boolean => {
  return !!getCurrentUserId()
}
