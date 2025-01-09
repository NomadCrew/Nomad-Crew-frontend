// src/auth/secure-token-manager.ts
import createSecureStore from '@neverdull-agency/expo-unlimited-secure-store';

class BasicTokenManager {
  private secureStore = createSecureStore();
  
  // If all you want is a place to store "something" else:
  public async setItem(key: string, value: string) {
    return this.secureStore.setItem(key, value);
  }
  public async getItem(key: string) {
    return this.secureStore.getItem(key);
  }
  public async removeItem(key: string) {
    return this.secureStore.removeItem(key);
  }
}
export const secureTokenManager = new BasicTokenManager();
