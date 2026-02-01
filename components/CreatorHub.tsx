import React, { useState } from 'react';
import { X, Star, BarChart2, Link, Copy, Check, LifeBuoy, Settings, LogOut, Loader2, Gift, History, Zap, ShoppingBag, Repeat, AlertTriangle, Mail, Bell, Video, Users, KeyRound, CheckCircle, Phone, MessageSquare, Globe, CreditCard, DollarSign } from 'lucide-react';
import { User } from 'firebase/auth';
import { Creator, Cashout, BonusCreditBatch, CreditExpirationLog } from '../types';
import { signInWithGoogle, handleSignOut, redeemPaymentCode, smartPayout, claimDailyReward, purchaseCreditsWithStripe, setupAutoRecharge, disableAutoRecharge, updateUserActivity, setupPhonePayout, rechargeToTossAccount } from '../services/firebaseService';
import { Timestamp } from 'firebase/firestore';

interface CreatorHubProps {
  onClose: () => void;
  user: User | null;
  creatorProfile: Creator | null;
  isLoadingProfile: boolean;
  refetchProfile: () => void;
}

const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.519-3.317-11.28-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.022,35.258,44,30.036,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);

const MIN_CASHOUT_CREDITS = 1000;
const AUTO_RECHARGE_AMOUNT = 500;
const AUTO_RECHARGE_THRESHOLD = 100;

const StatusBadge: React.FC<{status: Cashout['status']}> = ({ status }) => {
    const styles = {
        pending: 'bg-yellow-100 text-yellow-800',
        completed: 'bg-green-100 text-green-800',
        failed: 'bg-red-100 text-red-800',
    };
    return (
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};

interface AutoRechargeModalProps {
  onClose: () => void;
  onSave: () => void;
  isSaving: boolean;
  currentSettings?: Creator['auto_recharge'];
}

const AutoRechargeModal: React.FC<AutoRechargeModalProps> = ({ onClose, onSave, isSaving, currentSettings }) => {
    const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
    const [expiry, setExpiry] = useState("12/28");
    const [cvc, setCvc] = useState("123");

    return (
        <div className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative">
                <button onClick={onClose} className="absolute top-3 right-3 p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"><X size={18} /></button>
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 text-white">
                        <Repeat size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Setup Auto-Recharge</h2>
                    <p className="text-gray-500 text-sm mt-2">Never run out of Bonus Credits. Credits are for in-app use only and cannot be cashed out.</p>
                </div>
                
                <div className="text-left bg-gray-50 p-4 rounded-xl my-5 border border-gray-200">
                    <p className="text-sm font-bold text-gray-800">Recharge Rule</p>
                    <p className="text-sm text-gray-600 mt-1">When your Bonus Credit balance falls below <span className="font-bold">{AUTO_RECHARGE_THRESHOLD}</span>, we will automatically purchase <span className="font-bold">{AUTO_RECHARGE_AMOUNT} Bonus Credits</span> for you.</p>
                </div>

                <div className="space-y-3">
                     <div>
                        <label className="text-xs font-bold text-gray-600">Card Number (Simulation)</label>
                        <input type="text" value={cardNumber} onChange={e => setCardNumber(e.target.value)} placeholder="4242 4242 4242 4242" className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm"/>
                    </div>
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-600">Expiry</label>
                            <input type="text" value={expiry} onChange={e => setExpiry(e.target.value)} placeholder="MM/YY" className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm"/>
                        </div>
                        <div className="flex-1">
                             <label className="text-xs font-bold text-gray-600">CVC</label>
                            <input type="text" value={cvc} onChange={e => setCvc(e.target.value)} placeholder="123" className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm"/>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={onSave}
                    disabled={isSaving}
                    className="w-full mt-5 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors shadow-lg flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
                >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : 'Save and Activate'}
                </button>
            </div>
        </div>
    );
};


export const CreatorHub: React.FC<CreatorHubProps> = ({ onClose, user, creatorProfile, isLoadingProfile, refetchProfile }) => {
  const [hasCopied, setHasCopied] = useState(false);
  
  // Redeem state
  const [paymentCode, setPaymentCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);

  // Purchase State
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null); // "toss" or "stripe"
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);
  const [stripeAmount, setStripeAmount] = useState('10');


  // Cashout state
  const [isCashingOut, setIsCashingOut] = useState(false);
  const [cashoutError, setCashoutError] = useState<string | null>(null);
  const [cashoutSuccess, setCashoutSuccess] = useState<string | null>(null);

  // Daily Reward State
  const [isClaimingDaily, setIsClaimingDaily] = useState(false);
  const [dailyClaimError, setDailyClaimError] = useState<string | null>(null);

  // Auto-Recharge State
  const [isAutoRechargeModalOpen, setIsAutoRechargeModalOpen] = useState(false);
  const [isUpdatingRecharge, setIsUpdatingRecharge] = useState(false);

  // Notification Settings State
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);

  // New creator setup state
  const [setupStep, setSetupStep] = useState<'form' | 'success'>('form');
  const [setupSubStep, setSetupSubStep] = useState<'welcome' | 'form'>('welcome');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState('KR');
  const [notificationEmail, setNotificationEmail] = useState(user?.email || '');
  const [isCompletingProfile, setIsCompletingProfile] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);

  const handleLogin = async () => { await signInWithGoogle(); };
  const handleLogout = async () => { await handleSignOut(); onClose(); };

  const handleCopyLink = () => {
    if (!creatorProfile?.referral_link) return;
    navigator.clipboard.writeText(creatorProfile.referral_link);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const handleRedeem = async () => {
      if (!paymentCode.trim()) { setRedeemError("Please enter a payment code."); return; }
      setIsRedeeming(true);
      setRedeemError(null);
      setRedeemSuccess(null);
      try {
          const result = await redeemPaymentCode(paymentCode);
          setRedeemSuccess(`Success! ✨ ${result.creditsAdded.toFixed(2)} spendable credits have been added.`);
          setPaymentCode('');
          refetchProfile(); // Refetch profile to get new balance
      } catch (error: any) {
          setRedeemError(error.message || "An unknown error occurred.");
      } finally {
          setIsRedeeming(false);
      }
  };
  
  const handleTossRecharge = async (amountKRW: number) => {
    if (!confirm(`Are you sure you want to charge ${amountKRW.toLocaleString()} KRW to your phone bill? This is a simulated transaction.`)) return;
    setIsPurchasing('toss');
    setPurchaseError(null);
    setPurchaseSuccess(null);
    try {
        const result = await rechargeToTossAccount({ amountKRW });
        setPurchaseSuccess(`Success! 🎉 ${result.creditsAdded.toLocaleString()} bonus credits added.`);
        refetchProfile();
    } catch (error: any) {
        setPurchaseError(error.message || "An unknown error occurred during purchase.");
    } finally {
        setIsPurchasing(null);
    }
  };

  const handleStripeRecharge = async () => {
    const amountUSD = parseFloat(stripeAmount);
    if (isNaN(amountUSD) || amountUSD <= 0) {
        setPurchaseError("Please enter a valid amount in USD.");
        return;
    }
    if (!confirm(`Are you sure you want to purchase credits for $${amountUSD.toFixed(2)}? This is a simulated transaction.`)) return;
    
    setIsPurchasing('stripe');
    setPurchaseError(null);
    setPurchaseSuccess(null);
    try {
        const result = await purchaseCreditsWithStripe({ paymentMethodId: 'pm_card_visa', amountUSD });
        setPurchaseSuccess(`Success! 🎉 ${result.credits.toLocaleString()} bonus credits added. Your fee: $0.`);
        refetchProfile();
    } catch (error: any) {
        setPurchaseError(error.message || "An unknown error occurred during purchase.");
    } finally {
        setIsPurchasing(null);
    }
  };


  const handleClaimDailyReward = async () => {
    setIsClaimingDaily(true);
    setDailyClaimError(null);
    try {
      await claimDailyReward();
      refetchProfile(); // Refetch profile to get new balance
    } catch (error: any) {
      setDailyClaimError(error.message || "Could not claim reward. Please try again later.");
    } finally {
      setIsClaimingDaily(false);
    }
  };

  const handleCashout = async () => {
    if (!creatorProfile?.phone_payout) return;

    const { phone_number, country } = creatorProfile.phone_payout;
    const spendableCredits = Number(creatorProfile.spendable_credits) || 0;
    
    if (spendableCredits < MIN_CASHOUT_CREDITS) return;
    
    const dollarAmount = (spendableCredits / 10).toFixed(2);
    if (!confirm(`Are you sure you want to cash out ${spendableCredits.toLocaleString()} credits ($${dollarAmount})? This will be processed using the optimal method for ${country}.`)) return;

    setIsCashingOut(true);
    setCashoutError(null);
    setCashoutSuccess(null);
    try {
        const result = await smartPayout({ phoneNumber: phone_number, country });
        setCashoutSuccess(`Success! ${result.customer_amount.toLocaleString()} KRW sent. Platform fee: ${result.your_fee} KRW.`);
        refetchProfile(); // Refetch profile to get new balance
    } catch (error: any) {
        setCashoutError(error.message || "Cash out failed. Please try again.");
    } finally {
        setIsCashingOut(false);
    }
  };

  const handleSaveAutoRecharge = async () => {
    setIsUpdatingRecharge(true);
    try {
      await setupAutoRecharge(AUTO_RECHARGE_AMOUNT, AUTO_RECHARGE_THRESHOLD);
      refetchProfile();
      setIsAutoRechargeModalOpen(false);
    } catch (error) {
      alert("Failed to set up auto-recharge. Please try again.");
    } finally {
      setIsUpdatingRecharge(false);
    }
  };

  const handleDisableAutoRecharge = async () => {
    if (!confirm("Are you sure you want to disable auto-recharge? Your saved card will be removed.")) return;
    setIsUpdatingRecharge(true);
    try {
      await disableAutoRecharge();
      refetchProfile();
    } catch (error) {
      alert("Failed to disable auto-recharge. Please try again.");
    } finally {
      setIsUpdatingRecharge(false);
    }
  };

  const handleToggleNotification = async (
    settingKey: keyof NonNullable<Creator['notification_settings']>
  ) => {
    if (!creatorProfile) return;
    const currentSettings = creatorProfile.notification_settings || {};
    const currentValue = currentSettings[settingKey] !== false;
    const newSettings = {
      ...currentSettings,
      [settingKey]: !currentValue,
    };
    
    setIsUpdatingNotifications(true);
    try {
      await updateUserActivity(newSettings);
      refetchProfile();
    } catch (error) {
      alert("Failed to update notification settings. Please try again.");
    } finally {
      setIsUpdatingNotifications(false);
    }
  };
  
  const handleSetupPayouts = async () => {
    if (!phoneNumber.trim() || !notificationEmail.trim() || !country.trim()) {
      setSetupError("Please fill in all required fields.");
      return;
    }
    if (!confirm(`Is this your correct phone number: ${phoneNumber}? A 1 KRW charge will be made to set up payouts.`)) {
        return;
    }

    setIsCompletingProfile(true);
    setSetupError(null);
    try {
      await setupPhonePayout({ phoneNumber, notificationEmail, country });
      setSetupStep('success');
    } catch (error: any) {
      setSetupError(error.message || "An error occurred. Please try again.");
    } finally {
      setIsCompletingProfile(false);
    }
  };

  const renderLoginView = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gray-50"><div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg mb-6"><Star size={32} className="text-white" /></div><h2 className="text-2xl font-bold text-gray-900">Join the K-Kitchen Creator Hub</h2><p className="text-gray-500 mt-2 max-w-md">Share your passion for Korean food and earn credits when your followers shop through your unique link.</p><button onClick={handleLogin} className="mt-8 flex items-center justify-center gap-3 px-6 py-3 bg-white border border-gray-300 rounded-full font-semibold text-gray-800 hover:bg-gray-100 transition-colors shadow-sm"><GoogleIcon />Sign in with Google to Start</button><p className="text-xs text-gray-400 mt-4">By signing in, you agree to our Creator Terms of Service.</p></div>
  );

  const renderSetupSuccessView = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gray-50 animate-in fade-in duration-300">
      <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg mb-6 text-white ring-4 ring-white">
        <Check size={40} strokeWidth={3}/>
      </div>
      <h2 className="text-2xl font-bold text-gray-900">Setup Complete!</h2>
      <p className="text-gray-500 mt-2 max-w-md">
        Your phone number is verified and your payout channel is active. We've sent a confirmation email to <br/><span className="font-bold text-gray-800">{notificationEmail}</span>.
      </p>
      <button 
        onClick={refetchProfile} 
        className="mt-8 flex items-center justify-center gap-3 px-8 py-3 bg-gray-900 text-white font-bold rounded-full hover:bg-black transition-colors shadow-lg"
      >
        Enter Creator Hub
      </button>
    </div>
  );

  const renderSetupWelcomeView = () => (
    <div className="flex flex-col h-full bg-gray-50 p-6 overflow-y-auto text-center">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg mb-4 text-white">
            <Star size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Welcome to the Creator Program</h2>
        <p className="text-gray-500 text-sm mt-2 max-w-sm mx-auto">Turn your passion for K-Food into earnings. Here’s what you get:</p>
        
        <div className="mt-8 space-y-4 text-left">
            <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                    <DollarSign size={20} />
                </div>
                <div>
                    <h4 className="font-bold text-sm text-gray-800">Earn from Your Passion</h4>
                    <p className="text-xs text-gray-500">Get spendable credits for every sale through your link.</p>
                </div>
            </div>
             <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                    <Zap size={20} />
                </div>
                <div>
                    <h4 className="font-bold text-sm text-gray-800">Fast & Fair Payouts</h4>
                    <p className="text-xs text-gray-500">Withdraw earnings with 0% fees in Korea, low fees globally.</p>
                </div>
            </div>
             <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                    <Globe size={20} />
                </div>
                <div>
                    <h4 className="font-bold text-sm text-gray-800">Global Reach & Tools</h4>
                    <p className="text-xs text-gray-500">Access AI content tools to engage followers worldwide.</p>
                </div>
            </div>
        </div>

        <button 
            onClick={() => setSetupSubStep('form')}
            className="w-full mt-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors shadow-lg flex items-center justify-center gap-2"
        >
            Get Started
        </button>
    </div>
  );

  const renderSetupFormView = () => (
     <div className="flex flex-col h-full bg-gray-50 p-6 overflow-y-auto">
        <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg mb-4 text-white">
                <CheckCircle size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Complete Your Creator Setup</h2>
            <p className="text-gray-500 text-sm mt-2">Verify your info to activate your creator account and payouts.</p>
        </div>
        <div className="mt-8 space-y-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Step 1: Your Country</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Globe size={16} /></div>
                    <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="block w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none"
                    >
                        <option value="KR">South Korea</option>
                        <option value="US">United States</option>
                        <option value="JP">Japan</option>
                        <option value="GB">United Kingdom</option>
                        <option value="DE">Germany</option>
                        <option value="FR">France</option>
                        <option value="IN">India</option>
                        <option value="VN">Vietnam</option>
                        <option value="OTHER">Other</option>
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Step 2: Payouts & Notifications</label>
                <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Payout Phone Number</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Phone size={16} /></div>
                            <input 
                                type="tel" 
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="010-1234-5678" 
                                className="block w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1.5">A 1 KRW charge will be made to enable payouts.</p>
                    </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Notification Email</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Mail size={16} /></div>
                            <input 
                                type="email" 
                                value={notificationEmail}
                                onChange={(e) => setNotificationEmail(e.target.value)}
                                placeholder="user@notice.com" 
                                className="block w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>
                    </div>
                </div>
            </div>
             <div className="p-3 bg-gray-100 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 font-medium flex items-center gap-2"><KeyRound size={14} className="text-gray-400"/> API keys for Gemini and YouTube are managed by the platform and are not required here.</p>
            </div>
        </div>

        {setupError && <p className="text-xs text-red-600 mt-4 font-medium text-center">{setupError}</p>}

        <button 
            onClick={handleSetupPayouts}
            disabled={isCompletingProfile}
            className="w-full mt-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors shadow-lg flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
        >
            {isCompletingProfile ? <Loader2 size={18} className="animate-spin" /> : 'Activate Account'}
        </button>
    </div>
  );
  
  const renderSetupView = () => {
    if (setupStep === 'success') return renderSetupSuccessView();
    if (setupSubStep === 'welcome') return renderSetupWelcomeView();
    return renderSetupFormView();
  };

  const renderDashboardView = () => {
    if (isLoadingProfile) return (<div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gray-50"><Loader2 size={40} className="text-orange-500 animate-spin" /><p className="mt-4 text-gray-600 font-semibold">Loading Creator Profile...</p></div>);
    if (!creatorProfile) return renderSetupView();
    
    const formatDate = (timestamp?: Timestamp) => timestamp ? new Date(timestamp.toMillis()).toISOString().split('T')[0].replace(/-/g, '.') : 'N/A';
    const getDaysUntilExpiry = (timestamp?: Timestamp): number | null => {
        if (!timestamp) return null;
        const diff = timestamp.toMillis() - Date.now();
        if (diff < 0) return 0;
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    const bonusCreditsExpiry = creatorProfile.bonus_credits_expiry;
    const bonusCreditsExpiryDays = getDaysUntilExpiry(bonusCreditsExpiry);
    const totalBonusCredits = creatorProfile.bonus_credits ?? 0;
    const spendableCredits = Number(creatorProfile.spendable_credits) || 0;

    const canCashOut = spendableCredits >= MIN_CASHOUT_CREDITS;
    const lastClaimTime = creatorProfile.last_daily_claim?.toMillis() || 0;
    const isDailyRewardOnCooldown = (Date.now() - lastClaimTime) < (24 * 60 * 60 * 1000);
    
    const notificationSettings = {
        email_30_day_warning: creatorProfile.notification_settings?.email_30_day_warning !== false,
        push_7_day_warning: creatorProfile.notification_settings?.push_7_day_warning !== false,
        inactivity_warning: creatorProfile.notification_settings?.inactivity_warning !== false,
    };

    return (
      <div className="flex flex-col h-full bg-gray-50">
          <div className="p-6 border-b border-gray-200 bg-white flex items-center justify-between"><div className="flex items-center gap-4"><img src={user?.photoURL || ''} alt={user?.displayName || 'User'} className="w-14 h-14 rounded-full border-2 border-orange-500 p-0.5" /><div><p className="text-xs text-gray-500">Welcome back,</p><h3 className="font-bold text-xl text-gray-900">{user?.displayName}</h3></div></div><button onClick={handleLogout} title="Sign Out" className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors"><LogOut size={20} /></button></div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-4">💰 My Assets</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Spendable Credits Card */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 flex flex-col">
                          <div className="flex items-start justify-between">
                            <h5 className="font-bold text-green-900">💎 Spendable Credits</h5>
                            <button onClick={handleCashout} disabled={!canCashOut || isCashingOut} className="px-3 py-1 bg-green-200 text-green-800 text-xs font-bold rounded-md hover:bg-green-300 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed">
                                {isCashingOut ? <Loader2 size={12} className="animate-spin" /> : '💸 Withdraw'}
                            </button>
                          </div>
                          <p className="text-xs text-green-700 mt-1">Earned from affiliate sales. Can be cashed out.</p>
                          <div className="mt-auto pt-2">
                            <p className="text-2xl font-bold text-gray-900">{spendableCredits.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                            <p className="text-sm text-gray-500 font-medium">(= ${(spendableCredits / 10).toFixed(2)} USD)</p>
                            {!canCashOut && !isCashingOut && <p className="text-center text-xs text-green-700 mt-2">Minimum ${MIN_CASHOUT_CREDITS/10} to withdraw</p>}
                            {cashoutError && <p className="text-xs text-red-600 mt-2 font-medium">{cashoutError}</p>}
                            {cashoutSuccess && <p className="text-xs text-green-600 mt-2 font-medium">{cashoutSuccess}</p>}
                          </div>
                      </div>
                      {/* Bonus Credits Card */}
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 flex flex-col">
                         <h5 className="font-bold text-blue-900">🎁 Bonus Credits</h5>
                         <p className="text-xs text-blue-700 mt-1">For in-app use (e.g., Boost Post). Cannot be cashed out.</p>
                         <div className="mt-auto pt-2">
                           <p className="text-2xl font-bold text-gray-900">{totalBonusCredits.toLocaleString()}</p>
                           <p className="text-xs text-gray-500 font-medium">
                               Expires: <span className="font-semibold text-gray-700">{formatDate(bonusCreditsExpiry)}</span> 
                               {bonusCreditsExpiryDays !== null && ` (${bonusCreditsExpiryDays} days left ⏰)`}
                           </p>
                         </div>
                      </div>
                  </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <h4 className="font-bold text-gray-800 flex items-center gap-2"><ShoppingBag size={16} className="text-teal-600"/> Charge Bonus Credits</h4>
                  <p className="text-xs text-gray-500 mt-1">Purchase non-cashable credits for in-app features like 'Boost Post'.</p>
                  
                  {/* Payment Options */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                     {/* Option 1: Phone Bill Recharge */}
                     <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                         <h5 className="font-semibold text-sm flex items-center gap-2"><span>🇰🇷</span> Phone Bill Recharge (KRW)</h5>
                         <p className="text-xs text-gray-500 mt-1">Fast & Easy. Enter your number & complete in 5 seconds.</p>
                         <button onClick={() => handleTossRecharge(10000)} disabled={isPurchasing !== null} className="w-full mt-3 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm bg-gray-800 text-white hover:bg-black disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center">
                            {isPurchasing === 'toss' ? <Loader2 size={18} className="animate-spin" /> : 'Charge ₩10,000'}
                         </button>
                     </div>
                     {/* Option 2: Direct Payment */}
                     <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                         <h5 className="font-semibold text-sm flex items-center gap-2"><CreditCard size={16} /> Direct Payment (USD)</h5>
                         <p className="text-xs text-gray-500 mt-1">Best Value! Avg 1.8% fee (vs 30% on app stores). We cover the fee.</p>
                         <div className="mt-3 flex gap-2">
                             <div className="relative flex-grow">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                <input type="number" value={stripeAmount} onChange={e => setStripeAmount(e.target.value)} className="w-full pl-6 pr-2 py-2.5 border border-gray-300 rounded-lg text-sm" placeholder="10"/>
                             </div>
                             <button onClick={handleStripeRecharge} disabled={isPurchasing !== null} className="px-4 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm bg-gray-800 text-white hover:bg-black disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center">
                                {isPurchasing === 'stripe' ? <Loader2 size={18} className="animate-spin" /> : 'Pay'}
                             </button>
                         </div>
                     </div>
                  </div>

                  {purchaseError && <p className="text-xs text-red-600 mt-3 font-medium text-center">{purchaseError}</p>}
                  {purchaseSuccess && <p className="text-xs text-green-600 mt-3 font-medium text-center">{purchaseSuccess}</p>}
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm"><h4 className="font-bold text-gray-800 flex items-center gap-2"><Link size={16} className="text-orange-600"/> Your Unique Tracking Link</h4><p className="text-xs text-gray-500 mt-1">Share this link. You'll earn credits on purchases made through it.</p><div className="mt-4 flex items-center gap-2 p-2 bg-gray-100 rounded-lg"><input type="text" readOnly value={creatorProfile.referral_link} className="flex-1 bg-transparent text-sm text-gray-700 outline-none px-2" /><button onClick={handleCopyLink} className={`px-4 py-2 rounded-md text-xs font-bold transition-colors shadow-sm ${hasCopied ? 'bg-green-600 text-white' : 'bg-gray-800 text-white hover:bg-black'}`}>{hasCopied ? <Check size={14}/> : <Copy size={14} />}</button></div></div>
              
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <h4 className="font-bold text-gray-800 flex items-center gap-2"><Gift size={16} className="text-purple-600"/> Redeem Purchase Code</h4>
                  <p className="text-xs text-gray-500 mt-1">Enter a code from Amazon/Coupang to charge <span className="font-bold">Spendable (Cashable) Credits</span>.</p>
                  <div className="mt-4 flex items-center gap-2"><input type="text" value={paymentCode} onChange={(e) => setPaymentCode(e.target.value)} placeholder={`${creatorProfile.tracking_id}-AMZN_ORDER_ID`} className="flex-1 bg-gray-100 text-sm text-gray-700 outline-none px-3 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500" /><button onClick={handleRedeem} disabled={isRedeeming} className="px-5 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm bg-gray-800 text-white hover:bg-black disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]">{isRedeeming ? <Loader2 size={18} className="animate-spin"/> : 'Redeem'}</button></div>
                  {redeemError && <p className="text-xs text-red-600 mt-2 font-medium">{redeemError}</p>}{redeemSuccess && <p className="text-xs text-green-600 mt-2 font-medium">{redeemSuccess}</p>}
              </div>
              
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="font-bold text-gray-800 flex items-center gap-2"><Zap size={16} className="text-yellow-500"/> Daily Check-in Reward</h4>
                <p className="text-xs text-gray-500 mt-1">Claim your daily <span className="font-bold">Bonus Credits</span>. For in-app use only.</p>
                <div className="mt-4"><button onClick={handleClaimDailyReward} disabled={isDailyRewardOnCooldown || isClaimingDaily} className="w-full py-3 rounded-lg text-sm font-bold transition-colors shadow-sm bg-gray-800 text-white hover:bg-black disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]">{isClaimingDaily ? <Loader2 size={18} className="animate-spin"/> : isDailyRewardOnCooldown ? 'Come back tomorrow!' : 'Claim 10 Bonus Credits'}</button></div>{dailyClaimError && <p className="text-xs text-red-600 mt-2 font-medium">{dailyClaimError}</p>}
              </div>

              {creatorProfile.cashouts && creatorProfile.cashouts.length > 0 && (<div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm"><h4 className="font-bold text-gray-800 flex items-center gap-2 mb-3"><History size={16} className="text-indigo-600"/> Cashout History</h4><div className="space-y-2">{creatorProfile.cashouts.slice().reverse().map((cashout, index) => (<div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"><div className="font-semibold text-gray-700">Request for ${cashout.amount.toFixed(2)}</div><StatusBadge status={cashout.status} /></div>))}</div></div>)}

               <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                   <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-3">📧 Notification Settings</h4>
                   <p className="text-xs text-gray-500 mb-3 -mt-2">Notifications will be sent to: <span className="font-semibold text-gray-700">{creatorProfile.notification_email}</span></p>
                   <div className="space-y-3">
                       <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600">"Credit Expiration" Email (30 days)</p>
                           <div className="flex items-center gap-2">
                               {isUpdatingNotifications && <Loader2 size={16} className="animate-spin text-gray-400" />}
                               <button onClick={() => handleToggleNotification('email_30_day_warning')} disabled={isUpdatingNotifications} aria-pressed={notificationSettings.email_30_day_warning} className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 ${notificationSettings.email_30_day_warning ? 'bg-orange-600' : 'bg-gray-200'}`}>
                                   <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${notificationSettings.email_30_day_warning ? 'translate-x-5' : 'translate-x-0'}`}/>
                               </button>
                           </div>
                       </div>
                       <div className="flex items-center justify-between opacity-50 cursor-not-allowed" title="Coming Soon!">
                           <p className="text-sm text-gray-600">Push Notification (7 days)</p>
                           <button disabled className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-not-allowed rounded-full border-2 border-transparent bg-gray-200`}>
                               <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 translate-x-0`}/>
                           </button>
                       </div>
                       <div className="flex items-center justify-between opacity-50 cursor-not-allowed" title="Coming Soon!">
                           <p className="text-sm text-gray-600">Inactivity Warning (6 months)</p>
                           <button disabled className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-not-allowed rounded-full border-2 border-transparent bg-gray-200`}>
                               <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 translate-x-0`}/>
                           </button>
                       </div>
                   </div>
              </div>
              
              <div className="p-4 bg-gray-100 rounded-lg border border-gray-200"><h4 className="text-xs font-bold text-gray-500 flex items-center gap-2 mb-2 uppercase tracking-wider"><Settings size={14}/> System Status</h4><div className="flex items-center justify-between text-sm"><p className="text-gray-600">Gemini API Sync:</p><div className="flex items-center gap-1.5 font-semibold text-green-600"><span className="w-2 h-2 bg-green-500 rounded-full"></span>Connected</div></div><div className="flex items-center justify-between text-sm mt-1"><p className="text-gray-600">YouTube API Sync:</p><div className="flex items-center gap-1.5 font-semibold text-green-600"><span className="w-2 h-2 bg-green-500 rounded-full"></span>Connected</div></div></div>
              <a href="#" className="block text-center text-sm text-gray-500 hover:text-orange-600 font-medium transition-colors"><LifeBuoy size={14} className="inline-block mr-1.5"/>Creator Hub FAQ & Support</a>
          </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh] max-h-[700px]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white z-10 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white p-1.5 rounded-lg">
                        <Star size={18} />
                    </div>
                    <h2 className="font-bold text-lg">Creator Hub</h2>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-hidden">
                {user ? renderDashboardView() : renderLoginView()}
            </div>
        </div>
        {isAutoRechargeModalOpen && (
            <AutoRechargeModal 
                onClose={() => setIsAutoRechargeModalOpen(false)}
                onSave={handleSaveAutoRecharge}
                isSaving={isUpdatingRecharge}
                currentSettings={creatorProfile?.auto_recharge}
            />
        )}
    </div>
  );
};