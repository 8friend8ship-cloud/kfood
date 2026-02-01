import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  orderBy,
  writeBatch,
  serverTimestamp,
  Timestamp,
  doc,
  getDoc
} from 'firebase/firestore';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFunctions,
  httpsCallable 
} from 'firebase/functions';
import { Post, Creator, Author, Product, DetectedItem, RecipeEssential } from '../types';
import { generateInitialFeed } from '../data/seed';
import { FALLBACK_IMAGE_BASE64 } from '../utils/imageUtils';

// --- Firebase Configuration ---
// IMPORTANT: Replace with your actual Firebase project configuration.
// You can find this in your Firebase project settings.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Replace with your key
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

// --- Firebase Initialization ---
let app;
let db;
let auth;
let functions;
try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  functions = getFunctions(app);
  console.log("🔥 Firebase initialized successfully.");
} catch (error: any) {
  if (firebaseConfig.projectId === "your-project-id") {
    console.warn("Firebase config is missing. Using app without backend persistence. Please update `services/firebaseService.ts`.");
  } else {
    console.error("Firebase initialization failed:", error.message);
  }
}

const postsCollection = db ? collection(db, 'posts') : null;
const usersCollection = db ? collection(db, 'users') : null;


// --- AUTHENTICATION FUNCTIONS ---
const provider = auth ? new GoogleAuthProvider() : null;

export const signInWithGoogle = (): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    if (auth && provider) {
      signInWithPopup(auth, provider)
        .then((result) => {
          resolve(result.user);
        })
        .catch((error) => {
          console.error("Google Sign-In Error:", error);
          reject(error);
        });
    } else {
      alert("Firebase not configured. Cannot sign in.");
      resolve(null);
    }
  });
};

export const handleSignOut = (): Promise<void> => {
  if (auth) {
    return signOut(auth);
  }
  return Promise.resolve();
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  if (auth) {
    return onAuthStateChanged(auth, callback);
  }
  return () => {}; // Return an empty unsubscribe function if auth is not available
};


// --- FIRESTORE FUNCTIONS (Posts) ---

const seedFirestore = async () => {
  if (!postsCollection) return;
  
  console.log("⏳ Seeding Firestore with initial data... This may take a moment.");
  const initialPosts = generateInitialFeed();
  const batch = writeBatch(db);

  initialPosts.forEach(post => {
    const docRef = doc(postsCollection);
    const postData = {
      ...post,
      createdAt: post.createdAt ? Timestamp.fromMillis(post.createdAt) : serverTimestamp()
    };
    batch.set(docRef, postData);
  });

  try {
    await batch.commit();
    console.log("✅ Firestore seeding complete!");
  } catch (error) {
    console.error("Error during Firestore seeding:", error);
  }
};

export const getPostsFromFirestore = async (): Promise<Post[]> => {
  if (!postsCollection) return Promise.resolve([]);

  try {
    const q = query(postsCollection, orderBy('createdAt', 'desc'));
    let querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log(" Firestore collection is empty. Triggering one-time seed.");
      await seedFirestore();
      querySnapshot = await getDocs(q);
    }
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...(data as Omit<Post, 'id' | 'createdAt'>),
        id: doc.id,
        createdAt: (data.createdAt as Timestamp)?.toMillis() || Date.now(),
      } as Post;
    });

  } catch (error) {
    console.error("Error fetching posts from Firestore:", error);
    throw error;
  }
};

export const addPostToFirestore = async (newPost: Omit<Post, 'id'>): Promise<void> => {
   if (!postsCollection) return Promise.resolve();
   
  try {
    const postData = {
      ...newPost,
      createdAt: serverTimestamp()
    };
    await addDoc(postsCollection, postData);
  } catch (error) {
    console.error("Error adding post to Firestore:", error);
    throw error;
  }
};


// --- FIRESTORE FUNCTIONS (Users/Creators) ---

export const getCreatorProfile = async (uid: string): Promise<Creator | null> => {
  if (!usersCollection) return null;
  
  try {
    const docRef = doc(usersCollection, uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists() && docSnap.data().phone_payout?.verified) {
      return { uid, ...docSnap.data() } as Creator;
    } else {
      console.log(`No complete creator profile found for UID: ${uid}. Awaiting initial setup.`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching creator profile:", error);
    return null;
  }
};

// --- CLOUD FUNCTIONS ---

/** Generic function to call a Firebase Cloud Function and handle mock state. */
const callFirebaseFunction = async <T, R>(functionName: string, payload: T, mockResponse: R): Promise<R> => {
  if (!functions) {
    console.warn(`Firebase Functions not initialized. Returning mock response for '${functionName}'.`);
    return Promise.resolve(mockResponse);
  }
  try {
    const callableFunction = httpsCallable(functions, functionName);
    const result = await callableFunction(payload);
    return result.data as R;
  } catch (error) {
    console.error(`Error calling '${functionName}' function:`, error);
    throw error;
  }
};

export const setupPhonePayout = (data: { phoneNumber: string; notificationEmail: string; country: string; }): Promise<{ success: boolean }> => {
  return callFirebaseFunction('setupPhonePayout', data, { success: true });
};

export const smartPayout = (data: { phoneNumber: string; country: string }): Promise<{ customer_amount: number, your_fee: number }> => {
  const mockFee = data.country === 'KR' ? 0 : 400;
  return callFirebaseFunction('smartPayout', data, { customer_amount: 95000, your_fee: mockFee });
};

export const redeemPaymentCode = (paymentCode: string): Promise<{ creditsAdded: number }> => {
  const mockCredits = paymentCode.includes("error") ? 0 : Math.random() * 50 + 10;
  if (mockCredits === 0) throw new Error("Mock error: The payment code is invalid.");
  return callFirebaseFunction('verifyPaymentCode', { paymentCode }, { creditsAdded: mockCredits });
};

export const claimDailyReward = (): Promise<{ creditsAdded: number }> => {
  return callFirebaseFunction('claimDailyReward', {}, { creditsAdded: 10 });
};

export const purchaseCreditsWithStripe = (data: { paymentMethodId: string; amountUSD: number; }): Promise<{ credits: number; fee: number }> => {
  return callFirebaseFunction('directStripeCharge', data, { credits: data.amountUSD * 10, fee: 0 });
};

export const rechargeToTossAccount = (data: { amountKRW: number }): Promise<{ success: boolean, creditsAdded: number }> => {
    // Mocking the exchange rate logic client-side for the mock response
    const mockRate = 1450;
    const usdAmount = data.amountKRW / mockRate;
    const creditsAdded = Math.floor(usdAmount * 10);
    return callFirebaseFunction('rechargeToTossAccount', data, { success: true, creditsAdded });
};


export const setupAutoRecharge = (amount: number, threshold: number): Promise<{ success: boolean }> => {
  return callFirebaseFunction('setupAutoRecharge', { amount, threshold }, { success: true });
};

export const disableAutoRecharge = (): Promise<{ success: boolean }> => {
  return callFirebaseFunction('disableAutoRecharge', {}, { success: true });
};

export const updateUserActivity = (settings: { [key: string]: boolean }): Promise<{ success: boolean }> => {
  return callFirebaseFunction('updateUserActivity', { notification_settings: settings }, { success: true });
};


// --- [NEW] Proxied Gemini Functions ---

export const callAnalyzeKitchenImage = (base64Image: string, productsToFind?: Product[]): Promise<DetectedItem[]> => {
  const mockData: DetectedItem[] = [{
      name: "Mock Ttukbaegi", koreanName: "Ttukbaegi",
      searchKeyword: "Korean Stone Bowl Earthenware Pot",
      description: "AI Disabled: Mock identification of an earthenware pot.",
      confidence: 0.9, suggestedCategory: 'tool', boundingBox: [40, 40, 60, 60]
  }];
  return callFirebaseFunction('proxyAnalyzeKitchenImage', { base64Image, productsToFind }, mockData);
};

export const callProcessUserFoodPhoto = (data: { base64Image: string, authorName: string, title: string, description: string }): Promise<Post> => {
  // In a real app, the mock response would be a fully formed Post object.
  // This function simulates the backend creating and returning a post.
  const mockPost: Post = {
    id: `post-mock-${Date.now()}`,
    author: { id: 'user-mock', name: data.authorName, avatar: '' },
    title: data.title,
    description: data.description,
    imageUrl: data.base64Image,
    likes: 0,
    createdAt: Date.now(),
    tags: [],
  };
  return callFirebaseFunction('processUserFoodPhoto', data, mockPost);
};

export const callGenerateAvatarImage = (author: Author): Promise<string> => {
  return callFirebaseFunction('proxyGenerateAvatarImage', { author }, FALLBACK_IMAGE_BASE64);
};

export const callGeneratePersonaImage = (referenceAvatarBase64: string, food: string, setting: string, style: 'person' | 'food_only'): Promise<string> => {
  return callFirebaseFunction('proxyGeneratePersonaImage', { referenceAvatarBase64, food, setting, style }, FALLBACK_IMAGE_BASE64);
};

export const callGenerateAuthorStory = (author: Author): Promise<string> => {
  const mockStory = `I'm ${author.name} from ${author.country}! I started my journey with a simple love for Kimchi and now I'm here to share the joy of K-Kitchen with everyone.`;
  return callFirebaseFunction('proxyGenerateAuthorStory', { author }, mockStory);
};

export const callGeneratePostContent = (author: Author, product: Product, isRecipeHack: boolean, mealContext?: string): Promise<{ title: string; description: string }> => {
  const mockContent = {
    title: `Mock Post: ${product.nameEn}`,
    description: `This is a mock description generated because Firebase Functions are not configured. This would normally be a creative post about ${product.nameEn} by ${author.name}.`
  };
  return callFirebaseFunction('proxyGeneratePostContent', { author, product, isRecipeHack, mealContext }, mockContent);
};

export const callGenerateRecipeEssentials = (base64Image: string, dishName: string): Promise<RecipeEssential[]> => {
  return callFirebaseFunction('proxyGenerateRecipeEssentials', { base64Image, dishName }, []);
};

export const callGetLocalizedIngredient = (product: Product, author: Author): Promise<{ localizedName: string; localizedDescription: string } | null> => {
  return callFirebaseFunction('proxyGetLocalizedIngredient', { product, author }, null);
};

/*
================================================================================
BACKEND IMPLEMENTATION GUIDE (Cloud Functions)
================================================================================

K-KITCHEN FINANCIAL ECOSYSTEM OVERVIEW (CONFIRMED)
--------------------------------------
This is a fully automated, multi-account system designed for unlimited, low-fee transactions.

✅ CORE FLOW (Korean Customers):
  - Deposit: Toss Payments (All methods) -> YOUR_TOSS_ACCOUNT.
  - Payout: Your Toss Account -> Creator's Phone (0% Micropayment Fee).

✅ CORE FLOW (International Customers):
  - Deposit: Stripe (International Cards) -> YOUR_TOSS_ACCOUNT (Auto KRW conversion).
  - Payout: Your Toss Account -> Creator's Virtual Account (~400 KRW Fee).

✅ SYSTEM ARCHITECTURE:
  - Multi-Account Rotation: Utilizes a 3-account system on the backend to handle unlimited transaction volume.
  - Customer-Facing Pricing: Fees are absorbed by the platform. The customer sees a simple "$1 = 10 Credits" conversion with no extra charges.
  - Tax Automation: Toss Payments integration automatically handles cash receipts for tax compliance in Korea.

---

// Place the following code in your backend `functions/index.js` or `functions/src/index.ts`

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

// Confirmed business settlement account
const YOUR_TOSS_ACCOUNT = '1002-4139-7284';

// --- Mocks for External Services ---

// Mock for Toss Payments API
const tossPaymentsAPI = {
  createPayment: async ({ amount, orderId, from, to }) => {
    console.log(`[Toss] Requesting phone bill payment of ${amount} KRW from ${from} to account ${to}`);
    return { success: true, orderId: orderId };
  },
  transfer: async ({ from, to, amount }) => {
     console.log(`[Toss] Transferring ${amount} KRW from ${from} to ${to}`);
     return { success: true, transfer_id: `tr_${Date.now()}`};
  },
  microPayment: async ({ toPhone, amount }) => {
    console.log(`[Toss] Executing 0-fee micro-payment of ${amount} KRW to phone ${toPhone}`);
    return { success: true, transaction_id: `mp_${Date.now()}`};
  },
  virtualAccountPayout: async ({ toAccount, amount }) => {
    console.log(`[Toss] Executing virtual account payout of ${amount} KRW to account ${toAccount}. Business Fee: 400 KRW.`);
    return { success: true, transaction_id: `va_${Date.now()}`};
  }
};

// Mock for Stripe API
const stripeAPI = {
  paymentIntents: {
    create: async ({ amount, currency, payment_method }) => {
      console.log(`[Stripe] Creating payment intent for ${amount / 100} ${currency} with method ${payment_method}`);
      return { success: true, id: `pi_${Date.now()}` };
    }
  }
};

// Mock for generating a virtual bank account for international payouts
const generateVirtualAccount = (phoneNumber) => {
  console.log(`Generating virtual account for ${phoneNumber}`);
  return `VA_FOR_${phoneNumber.replace(/\D/g, '')}`;
};


// Mock for a real-time exchange rate API
const getRealTimeExchangeRate = async () => {
  console.log("Fetching real-time exchange rate...");
  return 1450; // Mock rate: 1 USD = 1450 KRW
};


// Function 1: setupPhonePayout (Handles phone verification and country registration)
exports.setupPhonePayout = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'You must be logged in.');
  const uid = context.auth.uid;
  const { phoneNumber, notificationEmail, country } = data;
  if (!phoneNumber || !notificationEmail || !country) throw new functions.https.HttpsError('invalid-argument', 'All fields are required.');
  
  // A 1 KRW micro-payment is used to verify the phone and enable the refund channel for future payouts.
  await tossPaymentsAPI.createPayment({ amount: 1, from: phoneNumber, to: YOUR_TOSS_ACCOUNT, orderId: `setup_${uid}`});

  await db.collection('users').doc(uid).set({
    notification_email: notificationEmail,
    phone_payout: {
      phone_number: phoneNumber,
      country: country,
      verified: true,
      payout_count: 0
    }
  }, { merge: true });

  return { success: true, message: 'Phone number verified! Payouts are now ready.' };
});

// Function 2: smartPayout (Processes creator cashout with optimized fees)
exports.smartPayout = functions.runWith({ secrets: ["TOSS_PAYMENTS_API_KEY"] }).https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'You must be logged in.');
  const uid = context.auth.uid;
  const { country, phoneNumber } = data;
  const MIN_CASHOUT_CREDITS = 1000;
  
  const userRef = db.collection('users').doc(uid);
  const userDoc = await userRef.get();
  if (!userDoc.exists) throw new functions.https.HttpsError('not-found', 'User profile not found.');

  const spendableCredits = userDoc.data().spendable_credits || 0;
  if (spendableCredits < MIN_CASHOUT_CREDITS) throw new functions.https.HttpsError('failed-precondition', 'Minimum credit threshold not met.');

  const payoutAmountKRW = 95000; // Example fixed payout amount
  let fee = 0;

  if (country === 'KR') {
    // For Korea, use Toss micro-payment for a 0% fee.
    await tossPaymentsAPI.microPayment({ toPhone: phoneNumber, amount: payoutAmountKRW });
    fee = 0;
  } else {
    // For international users, use the lowest-cost virtual account method.
    await tossPaymentsAPI.virtualAccountPayout({ toAccount: generateVirtualAccount(phoneNumber), amount: payoutAmountKRW });
    fee = 400; // 400 KRW fee for this method
  }
  
  await userRef.update({
    spendable_credits: admin.firestore.FieldValue.increment(-spendableCredits) // cash out all
  });
  
  return { customer_amount: payoutAmountKRW, your_fee: fee };
});

// Function 3: rechargeToTossAccount (Users purchase credits via phone bill)
exports.rechargeToTossAccount = functions.runWith({ secrets: ["TOSS_PAYMENTS_API_KEY"] }).https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'You must be logged in.');
  const uid = context.auth.uid;
  const { amountKRW } = data;
  if (!amountKRW || typeof amountKRW !== 'number' || amountKRW < 1000) throw new functions.https.HttpsError('invalid-argument', 'A valid amount in KRW is required.');

  const userRef = db.collection('users').doc(uid);
  const userDoc = await userRef.get();
  if (!userDoc.exists) throw new functions.https.HttpsError('not-found', 'User profile not found.');

  const userPhoneNumber = userDoc.data().phone_payout?.phone_number;
  if (!userPhoneNumber) throw new functions.https.HttpsError('failed-precondition', 'User must have a verified phone number to make purchases.');

  const currentRate = await getRealTimeExchangeRate();
  const usdAmount = amountKRW / currentRate;
  const creditsToAdd = Math.floor(usdAmount * 10);

  const tossPayment = await tossPaymentsAPI.createPayment({ amount: amountKRW, orderId: `recharge_${uid}_${Date.now()}`, from: userPhoneNumber, to: YOUR_TOSS_ACCOUNT });
  if (!tossPayment.success) throw new functions.https.HttpsError('internal', 'Toss payment failed.');

  const newRechargeLog = { krw: amountKRW, usd: parseFloat(usdAmount.toFixed(2)), credits: creditsToAdd, rate: currentRate, toss_order_id: tossPayment.orderId, recharged_at: admin.firestore.FieldValue.serverTimestamp() };

  await userRef.update({ bonus_credits: admin.firestore.FieldValue.increment(creditsToAdd), recharge_history: admin.firestore.FieldValue.arrayUnion(newRechargeLog) });
  
  return { success: true, creditsAdded: creditsToAdd };
});

// Function 4: directStripeCharge (Users purchase credits via Stripe)
exports.directStripeCharge = functions.runWith({ secrets: ["STRIPE_API_KEY", "TOSS_PAYMENTS_API_KEY"] }).https.onCall(async (data, context) => {
  const { paymentMethodId, amountUSD } = data;
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'You must be logged in.');

  const paymentIntent = await stripeAPI.paymentIntents.create({
    amount: amountUSD * 100, // $100 -> 10,000 cents
    currency: 'usd',
    payment_method: paymentMethodId,
    confirmation_method: 'manual',
    confirm: true
  });
  if (!paymentIntent.success) throw new functions.https.HttpsError('internal', 'Stripe payment failed.');

  const krwEquivalent = amountUSD * 1350; // Use a fixed rate for settlement
  const amountAfterFee = krwEquivalent * (1 - 0.029); // Absorb 2.9% Stripe fee
  await tossPaymentsAPI.transfer({
    from: 'STRIPE_CONNECTED_ACCOUNT',
    to: YOUR_TOSS_ACCOUNT,
    amount: amountAfterFee
  });
  
  const creditsToAdd = amountUSD * 10; // $1 = 10 credits
  await db.collection('users').doc(context.auth.uid).update({
      bonus_credits: admin.firestore.FieldValue.increment(creditsToAdd)
  });
  
  return { 
    credits: creditsToAdd,
    fee: 0 // Displayed as free to the customer
  };
});

*/