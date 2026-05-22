import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, X, Mail, Phone, User, LogIn, Upload, PlusCircle, 
  CheckCircle, AlertCircle, Shield, Smartphone, 
  KeyRound, ArrowLeft, PhoneCall, Lock
} from 'lucide-react';
import { API_BASE_URL } from '../config';
import '../assets/styles/Navbar.css';
import { 
  auth, 
  googleProvider, 
  facebookProvider,
  githubProvider,
  isFirebaseConfigured,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithPopup
} from '../firebase';


export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Login / Signup / Phone OTP / Forgot Password Modal States
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup' | 'forgot' | 'phone'
  
  // Email/Password inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Signup inputs
  const [signupName, setSignupName] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  
  // Forgot Password input
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Enter email, 2: Enter OTP & new password
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmNewPassword, setForgotConfirmNewPassword] = useState('');
  
  // Phone OTP inputs
  const [phoneInput, setPhoneInput] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const [loggedInUser, setLoggedInUser] = useState(null);
  const [authError, setAuthError] = useState('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');

  // Upload Modal States (Admin Only)
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState('documentsData'); // documentsData | midtermExams | finalExams
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadImage, setUploadImage] = useState('tccvang.jpg');
  const [uploadPdf, setUploadPdf] = useState('tccvang.pdf');
  const [uploadProf, setUploadProf] = useState('pnta');
  const [uploadProfName, setUploadProfName] = useState('Thầy Phan Ngô Tuấn Anh');
  const [uploadExternalUrl, setUploadExternalUrl] = useState('');
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle | loading | success | error
  const [uploadMsg, setUploadMsg] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Restore session from localStorage & Listen to Firebase auth changes
  useEffect(() => {
    const savedUser = localStorage.getItem('ueh_tcc_user');
    if (savedUser) {
      try {
        setLoggedInUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('ueh_tcc_user');
      }
    }

    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          // Synchronize with server JSON database
          const dbUser = await syncUserWithBackend(firebaseUser);
          setLoggedInUser(dbUser);
          localStorage.setItem('ueh_tcc_user', JSON.stringify(dbUser));
        } else {
          // Clear state only if it was logged in via a Firebase UID account
          setLoggedInUser((curr) => {
            if (curr && curr.uid) {
              localStorage.removeItem('ueh_tcc_user');
              return null;
            }
            return curr;
          });
        }
      });
      return () => unsubscribe();
    }
  }, []);

  // Close mobile menu when changing route
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Synchronize professor names when selection changes
  useEffect(() => {
    if (uploadProf === 'pnta') setUploadProfName('Thầy Phan Ngô Tuấn Anh');
    else if (uploadProf === 'ndt') setUploadProfName('Thầy Nguyễn Đình Tuấn');
    else if (uploadProf === 'ntv') setUploadProfName('Thầy Ngô Trấn Vũ');
    else if (uploadProf === 'ntvv') setUploadProfName('Thầy Nguyễn Thanh Vân');
  }, [uploadProf]);

  const handleNavClick = (sectionId) => {
    setIsOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const syncUserWithBackend = async (firebaseUser, customName = null) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: customName || firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Sinh viên UEH'),
          phoneNumber: firebaseUser.phoneNumber
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        return data.user;
      }
    } catch (error) {
      console.error("Lỗi đồng bộ với Backend:", error);
    }
    // Fallback offline session
    return {
      id: 'u-' + firebaseUser.uid.substring(0, 8),
      uid: firebaseUser.uid,
      username: firebaseUser.email || firebaseUser.phoneNumber || firebaseUser.uid,
      name: customName || firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Sinh viên UEH'),
      role: (firebaseUser.email === 'admin@ueh.edu.vn') ? 'Admin' : 'Student',
      phoneNumber: firebaseUser.phoneNumber
    };
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');
    if (!username || !password) {
      setAuthError('Vui lòng nhập đầy đủ email và mật khẩu!');
      return;
    }
    
    if (isFirebaseConfigured && auth) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, username, password);
        const dbUser = await syncUserWithBackend(userCredential.user);
        setLoggedInUser(dbUser);
        localStorage.setItem('ueh_tcc_user', JSON.stringify(dbUser));
        setShowLoginModal(false);
        setUsername('');
        setPassword('');
      } catch (error) {
        console.error("Firebase Login Error:", error);
        let msg = 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!';
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          msg = 'Email hoặc mật khẩu chưa chính xác!';
        } else if (error.code === 'auth/invalid-email') {
          msg = 'Định dạng email không hợp lệ!';
        } else if (error.code === 'auth/too-many-requests') {
          msg = 'Tài khoản tạm thời bị khóa do thử sai quá nhiều lần. Vui lòng đặt lại mật khẩu hoặc thử lại sau!';
        }
        setAuthError(msg);
      }
    } else {
      // Local Database Offline Fallback
      try {
        const response = await fetch(`${API_BASE_URL}/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        if (response.ok && data.success) {
          setLoggedInUser(data.user);
          localStorage.setItem('ueh_tcc_user', JSON.stringify(data.user));
          setShowLoginModal(false);
          setUsername('');
          setPassword('');
        } else {
          setAuthError(data.message || 'Đăng nhập thất bại.');
        }
      } catch (error) {
        // Offline fallback for demo
        const isDemoAdmin = username.toLowerCase().includes('admin');
        const mockUser = {
          username,
          name: isDemoAdmin ? 'Quản Trị Viên (Demo Offline)' : username.split('@')[0],
          role: isDemoAdmin ? 'Admin' : 'Student'
        };
        setLoggedInUser(mockUser);
        localStorage.setItem('ueh_tcc_user', JSON.stringify(mockUser));
        setShowLoginModal(false);
        setUsername('');
        setPassword('');
      }
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');

    if (!signupName || !signupUsername || !signupPassword) {
      setAuthError('Vui lòng điền đầy đủ thông tin đăng ký!');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setAuthError('Mật khẩu nhập lại không khớp!');
      return;
    }

    if (signupPassword.length < 6) {
      setAuthError('Mật khẩu phải tối thiểu 6 ký tự để bảo mật (Yêu cầu bởi Firebase)!');
      return;
    }

    if (isFirebaseConfigured && auth) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, signupUsername, signupPassword);
        const dbUser = await syncUserWithBackend(userCredential.user, signupName);
        setLoggedInUser(dbUser);
        localStorage.setItem('ueh_tcc_user', JSON.stringify(dbUser));
        setShowLoginModal(false);
        setSignupName('');
        setSignupUsername('');
        setSignupPassword('');
        setSignupConfirmPassword('');
      } catch (error) {
        console.error("Firebase Signup Error:", error);
        let msg = 'Đăng ký thất bại. Vui lòng thử lại!';
        if (error.code === 'auth/email-already-in-use') {
          msg = 'Địa chỉ email này đã được đăng ký bởi tài khoản khác!';
        } else if (error.code === 'auth/invalid-email') {
          msg = 'Địa chỉ email không đúng định dạng!';
        } else if (error.code === 'auth/weak-password') {
          msg = 'Mật khẩu quá yếu! Vui lòng nhập tối thiểu 6 ký tự.';
        }
        setAuthError(msg);
      }
    } else {
      // Local Database Offline Fallback
      try {
        const response = await fetch(`${API_BASE_URL}/api/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: signupName,
            username: signupUsername,
            password: signupPassword
          })
        });

        const data = await response.json();
        if (response.ok && data.success) {
          setAuthSuccessMsg('Đăng ký thành công! Hãy đăng nhập bằng tài khoản mới.');
          setUsername(signupUsername);
          setAuthMode('login');
          setSignupName('');
          setSignupUsername('');
          setSignupPassword('');
          setSignupConfirmPassword('');
        } else {
          setAuthError(data.message || 'Đăng ký thất bại.');
        }
      } catch (error) {
        setAuthError('Không thể kết nối đến máy chủ Backend để đăng ký. Hãy chạy backend!');
      }
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError('');
    setAuthSuccessMsg('');
    
    if (isFirebaseConfigured && auth) {
      try {
        const userCredential = await signInWithPopup(auth, googleProvider);
        const dbUser = await syncUserWithBackend(userCredential.user);
        setLoggedInUser(dbUser);
        localStorage.setItem('ueh_tcc_user', JSON.stringify(dbUser));
        setAuthSuccessMsg('Đăng nhập Google thành công!');
        setTimeout(() => {
          setShowLoginModal(false);
          setAuthSuccessMsg('');
        }, 1500);
      } catch (error) {
        console.error("Google Sign-In Error:", error);
        let msg = 'Đăng nhập Google thất bại.';
        if (error.code === 'auth/popup-closed-by-user') {
          msg = 'Cửa sổ đăng nhập Google đã bị đóng.';
        } else if (error.code === 'auth/cancelled-popup-request') {
          msg = 'Yêu cầu popup bị hủy.';
        } else {
          msg = `Lỗi: ${error.message}`;
        }
        setAuthError(msg);
      }
    } else {
      // Demo Mode: Simulate login but SYNC with actual live MongoDB database!
      setAuthSuccessMsg('🔄 Đang kết nối xác thực tài khoản Google...');
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        const mockFirebaseUser = {
          uid: 'google-demo-' + Math.random().toString(36).substr(2, 9),
          email: 'sinhvien.google@ueh.edu.vn',
          displayName: 'Google Student',
          phoneNumber: null
        };
        const dbUser = await syncUserWithBackend(mockFirebaseUser);
        setLoggedInUser(dbUser);
        localStorage.setItem('ueh_tcc_user', JSON.stringify(dbUser));
        setAuthSuccessMsg('🎉 Đăng nhập qua Google (Demo) thành công! Đã lưu vào MongoDB thật.');
        setTimeout(() => {
          setShowLoginModal(false);
          setAuthSuccessMsg('');
        }, 2000);
      } catch (error) {
        console.error("Mock Google sync error:", error);
        setAuthError('Không thể đồng bộ tài khoản Google với MongoDB.');
      }
    }
  };

  const handleFacebookLogin = async () => {
    setAuthError('');
    setAuthSuccessMsg('');
    
    if (isFirebaseConfigured && auth && facebookProvider) {
      try {
        const userCredential = await signInWithPopup(auth, facebookProvider);
        const dbUser = await syncUserWithBackend(userCredential.user);
        setLoggedInUser(dbUser);
        localStorage.setItem('ueh_tcc_user', JSON.stringify(dbUser));
        setAuthSuccessMsg('Đăng nhập Facebook thành công!');
        setTimeout(() => {
          setShowLoginModal(false);
          setAuthSuccessMsg('');
        }, 1500);
      } catch (error) {
        console.error("Facebook Sign-In Error:", error);
        let msg = 'Đăng nhập Facebook thất bại.';
        if (error.code === 'auth/popup-closed-by-user') {
          msg = 'Cửa sổ đăng nhập Facebook đã bị đóng.';
        } else if (error.code === 'auth/cancelled-popup-request') {
          msg = 'Yêu cầu popup bị hủy.';
        } else {
          msg = `Lỗi: ${error.message}`;
        }
        setAuthError(msg);
      }
    } else {
      // Demo Mode: Simulate login but SYNC with actual live MongoDB database!
      setAuthSuccessMsg('🔄 Đang kết nối xác thực tài khoản Facebook...');
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        const mockFirebaseUser = {
          uid: 'facebook-demo-' + Math.random().toString(36).substr(2, 9),
          email: 'sinhvien.facebook@ueh.edu.vn',
          displayName: 'Facebook Student',
          phoneNumber: null
        };
        const dbUser = await syncUserWithBackend(mockFirebaseUser);
        setLoggedInUser(dbUser);
        localStorage.setItem('ueh_tcc_user', JSON.stringify(dbUser));
        setAuthSuccessMsg('🎉 Đăng nhập qua Facebook (Demo) thành công! Đã lưu vào MongoDB thật.');
        setTimeout(() => {
          setShowLoginModal(false);
          setAuthSuccessMsg('');
        }, 2000);
      } catch (error) {
        console.error("Mock Facebook sync error:", error);
        setAuthError('Không thể đồng bộ tài khoản Facebook với MongoDB.');
      }
    }
  };

  const handleGithubLogin = async () => {
    setAuthError('');
    setAuthSuccessMsg('');
    
    if (isFirebaseConfigured && auth && githubProvider) {
      try {
        const userCredential = await signInWithPopup(auth, githubProvider);
        const dbUser = await syncUserWithBackend(userCredential.user);
        setLoggedInUser(dbUser);
        localStorage.setItem('ueh_tcc_user', JSON.stringify(dbUser));
        setAuthSuccessMsg('Đăng nhập GitHub thành công!');
        setTimeout(() => {
          setShowLoginModal(false);
          setAuthSuccessMsg('');
        }, 1500);
      } catch (error) {
        console.error("GitHub Sign-In Error:", error);
        let msg = 'Đăng nhập GitHub thất bại.';
        if (error.code === 'auth/popup-closed-by-user') {
          msg = 'Cửa sổ đăng nhập GitHub đã bị đóng.';
        } else if (error.code === 'auth/cancelled-popup-request') {
          msg = 'Yêu cầu popup bị hủy.';
        } else {
          msg = `Lỗi: ${error.message}`;
        }
        setAuthError(msg);
      }
    } else {
      // Demo Mode: Simulate login but SYNC with actual live MongoDB database!
      setAuthSuccessMsg('🔄 Đang kết nối xác thực tài khoản GitHub...');
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        const mockFirebaseUser = {
          uid: 'github-demo-' + Math.random().toString(36).substr(2, 9),
          email: 'sinhvien.github@ueh.edu.vn',
          displayName: 'GitHub Student',
          phoneNumber: null
        };
        const dbUser = await syncUserWithBackend(mockFirebaseUser);
        setLoggedInUser(dbUser);
        localStorage.setItem('ueh_tcc_user', JSON.stringify(dbUser));
        setAuthSuccessMsg('🎉 Đăng nhập qua GitHub (Demo) thành công! Đã lưu vào MongoDB thật.');
        setTimeout(() => {
          setShowLoginModal(false);
          setAuthSuccessMsg('');
        }, 2000);
      } catch (error) {
        console.error("Mock GitHub sync error:", error);
        setAuthError('Không thể đồng bộ tài khoản GitHub với MongoDB.');
      }
    }
  };


  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');
    if (!forgotEmail) {
      setAuthError('Vui lòng nhập địa chỉ email!');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotEmail)) {
      setAuthError('Địa chỉ email không đúng định dạng!');
      return;
    }

    setForgotLoading(true);
    
    if (isFirebaseConfigured && auth) {
      // Firebase Cloud Flow - sends real password reset email
      try {
        const actionCodeSettings = {
          url: window.location.origin + '/',
          handleCodeInApp: false,
        };
        await sendPasswordResetEmail(auth, forgotEmail, actionCodeSettings);
        setAuthSuccessMsg(`✅ Email khôi phục đã gửi tới ${forgotEmail}! Kiểm tra Hộp thư đến (và cả Spam).`);
        setForgotEmail('');
        setTimeout(() => {
          setAuthMode('login');
          setAuthSuccessMsg('');
        }, 6000);
      } catch (error) {
        console.error("Forgot Password Error:", error);
        let msg = 'Lỗi khi gửi email khôi phục mật khẩu.';
        if (error.code === 'auth/user-not-found') {
          msg = 'Không tìm thấy tài khoản nào được đăng ký với email này!';
        } else if (error.code === 'auth/invalid-email') {
          msg = 'Địa chỉ email không đúng định dạng!';
        } else if (error.code === 'auth/too-many-requests') {
          msg = 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng chờ vài phút và thử lại!';
        }
        setAuthError(msg);
      } finally {
        setForgotLoading(false);
      }
    } else {
      // Local Database/Nodemailer Flow
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: forgotEmail })
        });
        const data = await response.json();
        if (response.ok && data.success) {
          setAuthSuccessMsg(data.message || 'Mã OTP đã được gửi về email của bạn!');
          setForgotStep(2);
        } else {
          setAuthError(data.message || 'Không thể yêu cầu khôi phục mật khẩu.');
        }
      } catch (error) {
        console.error("Backend Forgot Password Error:", error);
        setAuthError('Không thể kết nối tới Backend để gửi OTP. Hãy bật backend server!');
      } finally {
        setForgotLoading(false);
      }
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');

    if (!forgotEmail) {
      setAuthError('Vui lòng nhập địa chỉ email!');
      return;
    }
    if (!forgotOtp || forgotOtp.trim().length !== 6) {
      setAuthError('Vui lòng nhập chính xác mã OTP gồm 6 chữ số!');
      return;
    }
    if (!forgotNewPassword) {
      setAuthError('Vui lòng nhập mật khẩu mới!');
      return;
    }
    if (forgotNewPassword.length < 3) {
      setAuthError('Mật khẩu mới phải từ 3 ký tự trở lên!');
      return;
    }
    if (forgotNewPassword !== forgotConfirmNewPassword) {
      setAuthError('Mật khẩu nhập lại không khớp!');
      return;
    }

    setForgotLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail,
          otpCode: forgotOtp.trim(),
          newPassword: forgotNewPassword
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setAuthSuccessMsg(data.message || 'Đặt lại mật khẩu thành công!');
        setForgotOtp('');
        setForgotNewPassword('');
        setForgotConfirmNewPassword('');
        setForgotStep(1);
        setTimeout(() => {
          setAuthMode('login');
          setAuthSuccessMsg('');
        }, 4000);
      } else {
        setAuthError(data.message || 'Mã xác thực OTP không chính xác hoặc đã hết hạn!');
      }
    } catch (error) {
      console.error("Backend Reset Password Error:", error);
      setAuthError('Không thể kết nối đến backend để xác thực OTP.');
    } finally {
      setForgotLoading(false);
    }
  };

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier && isFirebaseConfigured) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: (response) => {
            // Completed
          },
          'expired-callback': () => {
            setAuthError('reCAPTCHA đã hết hạn, vui lòng gửi lại mã OTP.');
          }
        });
      } catch (err) {
        console.error("Lỗi khởi tạo RecaptchaVerifier:", err);
      }
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');
    if (!phoneInput) {
      setAuthError('Vui lòng nhập số điện thoại!');
      return;
    }
    if (!isFirebaseConfigured) {
      setAuthError('Tính năng Phone OTP yêu cầu cấu hình Firebase Auth. Vui lòng cấu hình file .env!');
      return;
    }

    let formattedPhone = phoneInput.trim();
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '+84' + formattedPhone.substring(1);
    }
    if (!formattedPhone.startsWith('+')) {
      setAuthError('Số điện thoại phải bắt đầu bằng mã quốc gia (e.g. +84 cho Việt Nam hoặc dạng 09xxxxxx)');
      return;
    }

    setOtpLoading(true);
    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setIsOtpSent(true);
      setAuthSuccessMsg('Mã OTP đã được gửi về số điện thoại của bạn!');
    } catch (error) {
      console.error("Lỗi gửi SMS OTP:", error);
      let msg = error.message;
      if (error.code === 'auth/invalid-phone-number') {
        msg = 'Số điện thoại không đúng định dạng quốc tế!';
      } else if (error.code === 'auth/too-many-requests') {
        msg = 'Hệ thống tạm khóa do gửi quá nhiều SMS. Vui lòng thử lại sau!';
      }
      setAuthError(msg || 'Lỗi gửi mã OTP. Đảm bảo số điện thoại hợp lệ và Captcha hoạt động.');
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        } catch(e) {}
      }
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');
    if (!verificationCode) {
      setAuthError('Vui lòng nhập mã xác thực OTP!');
      return;
    }

    setOtpLoading(true);
    try {
      const result = await confirmationResult.confirm(verificationCode);
      const dbUser = await syncUserWithBackend(result.user);
      setLoggedInUser(dbUser);
      localStorage.setItem('ueh_tcc_user', JSON.stringify(dbUser));
      setShowLoginModal(false);
      
      setIsOtpSent(false);
      setPhoneInput('');
      setVerificationCode('');
      setConfirmationResult(null);
    } catch (error) {
      console.error("Lỗi xác nhận mã OTP:", error);
      setAuthError('Mã OTP chưa chính xác hoặc đã hết hạn!');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleLogout = async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await firebaseSignOut(auth);
      } catch (error) {
        console.error("Lỗi đăng xuất Firebase:", error);
      }
    }
    setLoggedInUser(null);
    localStorage.removeItem('ueh_tcc_user');
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadTitle || !uploadDesc) {
      setUploadStatus('error');
      setUploadMsg('Vui lòng nhập đầy đủ tiêu đề và mô tả!');
      return;
    }

    setUploadStatus('loading');
    setUploadMsg('');

    const itemPayload = {
      title: uploadTitle,
      desc: uploadDesc,
      image: uploadImage,
      pdf: uploadPdf
    };

    if (uploadType === 'documentsData') {
      itemPayload.category = 'latest';
      itemPayload.categoryLabel = 'Tài liệu mới nhất';
      if (uploadExternalUrl) {
        itemPayload.externalUrl = uploadExternalUrl;
      }
    } else if (uploadType === 'midtermExams') {
      itemPayload.professor = uploadProf;
      itemPayload.professorName = uploadProfName;
    } else if (uploadType === 'finalExams') {
      itemPayload.hasDetailRoute = false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: uploadType,
          item: itemPayload,
          adminRole: loggedInUser?.role,
          uid: loggedInUser?.uid,
          email: loggedInUser?.username
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setUploadStatus('success');
        setUploadMsg(data.message || 'Đăng tải thành công!');
        
        setUploadTitle('');
        setUploadDesc('');
        setUploadExternalUrl('');

        setTimeout(() => {
          setShowUploadModal(false);
          setUploadStatus('idle');
          setUploadMsg('');
          window.location.reload();
        }, 1500);
      } else {
        setUploadStatus('error');
        setUploadMsg(data.message || 'Có lỗi xảy ra khi đăng tải.');
      }
    } catch (error) {
      setUploadStatus('error');
      setUploadMsg('Lỗi kết nối server Backend! Hãy chắc chắn server port 3001 đã khởi động.');
    }
  };

  return (
    <>
      <header className={`header-wrapper ${isScrolled ? 'scrolled' : ''}`}>
        {/* Topbar Info */}
        <div className="topbar">
          <div className="container topbar-content">
            <div className="contact-links">
              <a href="mailto:luphuc321@gmail.com" className="contact-item">
                <Mail size={14} />
                <span>luphuc321@gmail.com</span>
              </a>
              <a href="tel:0815451095" className="contact-item">
                <Phone size={14} />
                <span>0815451095</span>
              </a>
            </div>
            <div className="author-badge">
              <span>Học tập & Chia sẻ</span>
              <span className="author-name">Lữ Phúc - K50 UEH</span>
            </div>
          </div>
        </div>

        {/* Branding Navigation */}
        <nav className="navbar">
          <div className="container navbar-container">
            <Link to="/" className="navbar-logo" onClick={() => window.scrollTo(0, 0)}>
              <span className="logo-helper">UEH</span>
              <span className="logo-main">TCC</span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="nav-links">
              <Link to="/" className={`nav-link-item ${location.pathname === '/' ? 'active' : ''}`} onClick={() => window.scrollTo(0, 0)}>Trang Chủ</Link>
              <button className="nav-link-item" onClick={() => handleNavClick('about')}>Về Chúng Tôi</button>
              <Link to="/resources?category=all" className={`nav-link-item ${location.pathname === '/resources' ? 'active' : ''}`}>Thư Viện</Link>
              <button className="nav-link-item" onClick={() => handleNavClick('exams')}>Đề Thi TCC</button>
              <button className="nav-link-item" onClick={() => handleNavClick('midterm')}>Đề Giữa Kỳ</button>
              <Link to="/20-10" className={`nav-link-item rose-link ${location.pathname === '/20-10' ? 'active' : ''}`}>Quà 20/10</Link>
            </div>

            {/* Login Action / Admin Action */}
            <div className="auth-action">
              {loggedInUser ? (
                <div className="user-profile">
                  {loggedInUser.role === 'Admin' && (
                    <button 
                      className="btn btn-secondary btn-upload-nav mr-3 text-teal" 
                      onClick={() => setShowUploadModal(true)}
                    >
                      <PlusCircle size={15} />
                      <span>Đăng tài liệu</span>
                    </button>
                  )}
                  <User size={16} />
                  <span className="user-profile-name">Chào, {loggedInUser.name}</span>
                  <button className="btn-logout ml-2" onClick={handleLogout}>Thoát</button>
                </div>
              ) : (
                <button className="btn btn-primary btn-login-nav" onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccessMsg(''); setShowLoginModal(true); }}>
                  <LogIn size={15} />
                  <span>Đăng Nhập</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Sidebar Drawer */}
        <div className={`mobile-drawer ${isOpen ? 'open' : ''}`}>
          <div className="mobile-drawer-overlay" onClick={() => setIsOpen(false)}></div>
          <div className="mobile-drawer-content">
            <div className="drawer-header">
              <span className="logo-main">Menu UEH TCC</span>
              <button className="close-btn" onClick={() => setIsOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="mobile-links">
              <Link to="/" className="mobile-link-item" onClick={() => { setIsOpen(false); window.scrollTo(0, 0); }}>Trang Chủ</Link>
              <button className="mobile-link-item" onClick={() => handleNavClick('about')}>Về Chúng Tôi</button>
              <Link to="/resources?category=all" className="mobile-link-item" onClick={() => setIsOpen(false)}>Thư Viện Tài Liệu</Link>
              <button className="mobile-link-item" onClick={() => handleNavClick('exams')}>Đề Thi TCC</button>
              <button className="mobile-link-item" onClick={() => handleNavClick('midterm')}>Đề Giữa Kỳ</button>
              <Link to="/20-10" className="mobile-link-item rose-link" onClick={() => setIsOpen(false)}>Quà 20/10</Link>
              
              <div className="mobile-drawer-auth">
                {loggedInUser ? (
                  <div className="mobile-user-profile">
                    <div className="user-details mb-3">
                      <User size={20} />
                      <span>{loggedInUser.name} ({loggedInUser.role})</span>
                    </div>
                    {loggedInUser.role === 'Admin' && (
                      <button 
                        className="btn btn-secondary w-full mb-2 text-teal" 
                        onClick={() => { setIsOpen(false); setShowUploadModal(true); }}
                      >
                        <PlusCircle size={15} />
                        <span>Đăng tài liệu Admin</span>
                      </button>
                    )}
                    <button className="btn btn-secondary w-full" onClick={handleLogout}>Đăng Xuất</button>
                  </div>
                ) : (
                  <button className="btn btn-primary w-full" onClick={() => { setIsOpen(false); setAuthMode('login'); setAuthError(''); setAuthSuccessMsg(''); setShowLoginModal(true); }}>
                    <LogIn size={15} />
                    <span>Đăng Nhập</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Auth Modal (Login / Sign Up / Forgot Password / SMS OTP) */}
      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowLoginModal(false)}>
              <X size={20} />
            </button>
            
            <div className="modal-header">
              {authMode === 'login' && <User size={32} className="modal-icon text-teal animate-pulse" />}
              {authMode === 'signup' && <User size={32} className="modal-icon text-teal animate-pulse" />}
              {authMode === 'forgot' && <KeyRound size={32} className="modal-icon text-rose animate-pulse" />}
              {authMode === 'phone' && <Smartphone size={32} className="modal-icon text-teal animate-pulse" />}
              
              <h3>
                {authMode === 'login' && 'Đăng Nhập UEH TCC'}
                {authMode === 'signup' && 'Đăng Ký Thành Viên'}
                {authMode === 'forgot' && 'Khôi Phục Mật Khẩu'}
                {authMode === 'phone' && 'Đăng Nhập Bằng SMS OTP'}
              </h3>
              <p>
                {authMode === 'login' && 'Hệ thống hỗ trợ lưu lịch sử học tập'}
                {authMode === 'signup' && 'Tạo tài khoản học tập cá nhân'}
                {authMode === 'forgot' && 'Nhập email để nhận liên kết khôi phục mật khẩu'}
                {authMode === 'phone' && (isOtpSent ? 'Nhập mã xác thực đã gửi về số điện thoại' : 'Xác thực tài khoản qua số điện thoại')}
              </p>
            </div>

            {/* Elegant connection status badge */}
            <div className="demo-badge-container">
              {isFirebaseConfigured ? (
                <div className="demo-mode-badge" style={{ color: '#34d399', background: 'rgba(52, 211, 153, 0.06)', borderColor: 'rgba(52, 211, 153, 0.12)' }}>
                  <span className="w-2 h-2 rounded-full inline-block mr-1" style={{ backgroundColor: '#34d399', width: '6px', height: '6px', borderRadius: '50%' }}></span>
                  <span>Đã kết nối Firebase Cloud</span>
                </div>
              ) : (
                <div className="demo-mode-badge">
                  <span className="w-2 h-2 rounded-full inline-block mr-1" style={{ backgroundColor: 'var(--accent-teal)', width: '6px', height: '6px', borderRadius: '50%' }}></span>
                  <span>Đồng bộ Đám mây MongoDB Atlas</span>
                </div>
              )}
            </div>

            {authError && <div className="error-alert">{authError}</div>}
            {authSuccessMsg && <div className="success-alert">{authSuccessMsg}</div>}

            {/* 1. LOGIN FORM */}
            {authMode === 'login' && (
              <form className="modal-form" onSubmit={handleLoginSubmit}>
                <div className="form-group">
                  <label htmlFor="username">Email đăng nhập / Tài khoản</label>
                  <div className="input-with-icon">
                    <Mail size={18} className="input-icon" />
                    <input
                      type="text"
                      id="username"
                      className="form-input"
                      placeholder="Email hoặc tài khoản đăng nhập"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <div className="form-group-header">
                    <label htmlFor="password">Mật khẩu</label>
                    <button 
                      type="button" 
                      className="forgot-password-link" 
                      onClick={() => { setAuthMode('forgot'); setAuthError(''); setAuthSuccessMsg(''); }}
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                  <div className="input-with-icon">
                    <Lock size={18} className="input-icon" />
                    <input
                      type="password"
                      id="password"
                      className="form-input"
                      placeholder="Nhập mật khẩu của bạn"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '10px' }}>Đăng Nhập</button>
                
                <div className="auth-divider">hoặc đăng nhập bằng</div>

                <div className="social-login-grid">
                  {/* Google Button */}
                  <button 
                    type="button" 
                    className="btn-social google" 
                    onClick={handleGoogleLogin} 
                    title="Đăng nhập qua Google"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                    </svg>
                  </button>

                  {/* Facebook Button */}
                  <button 
                    type="button" 
                    className="btn-social facebook" 
                    onClick={handleFacebookLogin} 
                    title="Đăng nhập qua Facebook"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" style={{ color: '#1877F2' }}>
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </button>

                  {/* GitHub Button */}
                  <button 
                    type="button" 
                    className="btn-social github" 
                    onClick={handleGithubLogin} 
                    title="Đăng nhập qua GitHub"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" style={{ color: '#F8FAFC' }}>
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                    </svg>
                  </button>
                </div>

                <div style={{ textAlign: 'center', marginTop: '12px' }}>
                  <button 
                    type="button" 
                    className="text-xs text-teal font-semibold hover:underline"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    onClick={() => { setAuthMode('phone'); setAuthError(''); setAuthSuccessMsg(''); }}
                  >
                    <Smartphone size={13} />
                    <span>Đăng nhập Phone SMS</span>
                  </button>
                </div>

                <div className="auth-modal-switch mt-4 text-center text-sm text-gray-400">
                  <span>Chưa có tài khoản? </span>
                  <button type="button" className="text-teal font-semibold hover:underline" onClick={() => { setAuthMode('signup'); setAuthError(''); setAuthSuccessMsg(''); }}>Đăng ký ngay</button>
                </div>

                <div className="auth-footer-note">
                  🔒 Dữ liệu lưu trữ đám mây MongoDB Atlas bảo mật tuyệt đối.
                </div>
              </form>
            )}

            {/* 2. SIGN UP FORM */}
            {authMode === 'signup' && (
              <form className="modal-form" onSubmit={handleSignupSubmit}>
                <div className="form-group">
                  <label htmlFor="signupName">Họ và Tên của bạn</label>
                  <div className="input-with-icon">
                    <User size={17} className="input-icon" />
                    <input
                      type="text"
                      id="signupName"
                      className="form-input"
                      placeholder="Nguyễn Văn A"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="signupUsername">Địa chỉ Email</label>
                  <div className="input-with-icon">
                    <Mail size={17} className="input-icon" />
                    <input
                      type="email"
                      id="signupUsername"
                      className="form-input"
                      placeholder="sinhvien@ueh.edu.vn"
                      value={signupUsername}
                      onChange={(e) => setSignupUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="signupPassword">Mật khẩu</label>
                  <div className="input-with-icon">
                    <Lock size={17} className="input-icon" />
                    <input
                      type="password"
                      id="signupPassword"
                      className="form-input"
                      placeholder="Tối thiểu 6 ký tự"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="signupConfirmPassword">Nhập lại mật khẩu</label>
                  <div className="input-with-icon">
                    <Lock size={17} className="input-icon" />
                    <input
                      type="password"
                      id="signupConfirmPassword"
                      className="form-input"
                      placeholder="Xác nhận mật khẩu"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary w-full">Đăng Ký Tài Khoản</button>
                
                <div className="auth-modal-switch mt-4 text-center text-sm">
                  <span>Đã có tài khoản? </span>
                  <button type="button" className="text-teal font-semibold hover:underline" onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccessMsg(''); }}>Đăng nhập ngay</button>
                </div>
              </form>
            )}

            {/* 3. FORGOT PASSWORD FORM */}
            {authMode === 'forgot' && (
              forgotStep === 1 ? (
                <form className="modal-form" onSubmit={handleForgotPasswordSubmit}>
                  <div className="form-group">
                    <label htmlFor="forgotEmail">Email đã đăng ký tài khoản</label>
                    <div className="input-with-icon">
                      <Mail size={17} className="input-icon" />
                      <input
                        type="email"
                        id="forgotEmail"
                        className="form-input"
                        placeholder="sinhvien@ueh.edu.vn"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>
                  
                  <button type="submit" className="btn btn-primary w-full" disabled={forgotLoading}>
                    {forgotLoading ? (
                      <span>⏳ Đang gửi email...</span>
                    ) : (
                      isFirebaseConfigured && auth ? '📧 Gửi Link Đặt Lại Mật Khẩu' : 'Gửi Mã OTP Xác Thực'
                    )}
                  </button>

                  <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#64748b', lineHeight: '1.5' }}>
                    Firebase sẽ gửi email chứa link đặt lại mật khẩu.<br/>Nhớ kiểm tra cả thư mục Spam!
                  </p>

                  <div className="text-center mt-3">
                    <button 
                      type="button" 
                      className="btn-back-link" 
                      onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccessMsg(''); setForgotStep(1); }}
                    >
                      <ArrowLeft size={16} />
                      <span>Quay lại Đăng nhập</span>
                    </button>
                  </div>
                </form>
              ) : (
                <form className="modal-form" onSubmit={handleResetPasswordSubmit}>
                  <div className="form-group">
                    <label htmlFor="forgotOtp">Nhập mã OTP (6 chữ số)</label>
                    <div className="input-with-icon">
                      <Shield size={17} className="input-icon" />
                      <input
                        type="text"
                        id="forgotOtp"
                        className="form-input"
                        placeholder="123456"
                        maxLength="6"
                        value={forgotOtp}
                        onChange={(e) => setForgotOtp(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="forgotNewPassword">Mật khẩu mới</label>
                    <div className="input-with-icon">
                      <Lock size={17} className="input-icon" />
                      <input
                        type="password"
                        id="forgotNewPassword"
                        className="form-input"
                        placeholder="Tối thiểu 3 ký tự"
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="forgotConfirmNewPassword">Xác nhận mật khẩu mới</label>
                    <div className="input-with-icon">
                      <Lock size={17} className="input-icon" />
                      <input
                        type="password"
                        id="forgotConfirmNewPassword"
                        className="form-input"
                        placeholder="Nhập lại mật khẩu mới"
                        value={forgotConfirmNewPassword}
                        onChange={(e) => setForgotConfirmNewPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <button type="submit" className="btn btn-primary w-full" disabled={forgotLoading}>
                    {forgotLoading ? 'Đang xử lý...' : 'Xác Nhận Đổi Mật Khẩu'}
                  </button>

                  <div className="text-center mt-3" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button 
                      type="button" 
                      className="btn-back-link" 
                      onClick={() => { setForgotStep(1); setAuthError(''); setAuthSuccessMsg(''); }}
                    >
                      <ArrowLeft size={16} />
                      <span>Quay lại</span>
                    </button>
                    <button 
                      type="button" 
                      className="text-teal text-sm font-semibold hover:underline" 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      onClick={handleForgotPasswordSubmit}
                      disabled={forgotLoading}
                    >
                      Gửi lại mã OTP
                    </button>
                  </div>
                </form>
              )
            )}

            {/* 4. SMS OTP FORM */}
            {authMode === 'phone' && (
              <form className="modal-form" onSubmit={isOtpSent ? handleVerifyOtp : handleSendOtp}>
                {!isOtpSent ? (
                  <>
                    <div className="form-group">
                      <label htmlFor="phoneInput">Số điện thoại của bạn</label>
                      <div className="input-with-icon">
                        <Smartphone size={17} className="input-icon" />
                        <input
                          type="tel"
                          id="phoneInput"
                          className="form-input"
                          placeholder="+84912345678"
                          value={phoneInput}
                          onChange={(e) => setPhoneInput(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div id="recaptcha-container"></div>
                    
                    <button type="submit" className="btn btn-primary w-full" disabled={otpLoading}>
                      <PhoneCall size={16} />
                      <span>{otpLoading ? 'Đang gửi mã...' : 'Gửi mã xác thực OTP'}</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="form-group">
                      <label htmlFor="verificationCode">Nhập mã OTP gồm 6 chữ số</label>
                      <div className="input-with-icon">
                        <Shield size={17} className="input-icon" />
                        <input
                          type="text"
                          id="verificationCode"
                          className="form-input"
                          placeholder="123456"
                          maxLength="6"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <button type="submit" className="btn btn-primary w-full" disabled={otpLoading}>
                      <span>{otpLoading ? 'Đang xác thực...' : 'Xác nhận Đăng Nhập'}</span>
                    </button>
                    
                    <div className="auth-modal-switch mt-2 text-sm">
                      <span>Không nhận được mã? </span>
                      <button 
                        type="button" 
                        className="text-teal font-semibold hover:underline" 
                        onClick={handleSendOtp} 
                        disabled={otpLoading}
                      >
                        Gửi lại mã
                      </button>
                    </div>
                  </>
                )}

                <div className="text-center mt-3">
                  <button 
                    type="button" 
                    className="btn-back-link" 
                    onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccessMsg(''); setIsOtpSent(false); setConfirmationResult(null); }}
                  >
                    <ArrowLeft size={16} />
                    <span>Quay lại Đăng nhập</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Admin Upload Modal */}
      {showUploadModal && loggedInUser?.role === 'Admin' && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content glass-panel" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowUploadModal(false)}>
              <X size={20} />
            </button>
            
            <div className="modal-header">
              <Shield size={32} className="modal-icon text-teal" />
              <h3>Đăng Tải Tài Liệu Mới</h3>
              <p>Hệ thống tự động phát hành Real-time lên trang chủ và thư viện</p>
            </div>

            <form className="modal-form" onSubmit={handleUploadSubmit}>
              <div className="form-group">
                <label htmlFor="up-type">Phân loại học liệu</label>
                <select 
                  id="up-type" 
                  className="form-input select-input"
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                >
                  <option value="documentsData">Ấn phẩm & Tài liệu ôn tập</option>
                  <option value="midtermExams">Đề thi giữa kỳ của giảng viên</option>
                  <option value="finalExams">Đề thi cuối kỳ chính thức</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="up-title">Tiêu đề tài liệu</label>
                <input 
                  type="text" 
                  id="up-title" 
                  className="form-input" 
                  placeholder="e.g. Tuyển tập 50 câu trắc nghiệm giới hạn" 
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="up-desc">Mô tả tóm tắt nội dung</label>
                <textarea 
                  id="up-desc" 
                  className="form-input text-area" 
                  rows="3" 
                  placeholder="e.g. Tài liệu gồm các câu trắc nghiệm giới hạn chọn lọc kèm lời giải thích chương 4..." 
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  required
                ></textarea>
              </div>

              {/* Conditional Prof Options for Midterms */}
              {uploadType === 'midtermExams' && (
                <div className="form-row-2">
                  <div className="form-group">
                    <label htmlFor="up-prof">Mã giảng viên</label>
                    <select 
                      id="up-prof" 
                      className="form-input select-input"
                      value={uploadProf}
                      onChange={(e) => setUploadProf(e.target.value)}
                    >
                      <option value="pnta">pnta (Thầy Phan Ngô Tuấn Anh)</option>
                      <option value="ndt">ndt (Thầy Nguyễn Đình Tuấn)</option>
                      <option value="ntv">ntv (Thầy Ngô Trấn Vũ)</option>
                      <option value="ntvv">ntvv (Thầy Nguyễn Thanh Vân)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Tên giảng viên</label>
                    <input type="text" className="form-input" value={uploadProfName} disabled />
                  </div>
                </div>
              )}

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="up-image">Tên tệp hình ảnh bìa (Thư mục images)</label>
                  <input 
                    type="text" 
                    id="up-image" 
                    className="form-input" 
                    placeholder="e.g. tccvang.jpg" 
                    value={uploadImage}
                    onChange={(e) => setUploadImage(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="up-pdf">Tên tệp PDF tài liệu (Thư mục docs)</label>
                  <input 
                    type="text" 
                    id="up-pdf" 
                    className="form-input" 
                    placeholder="e.g. tccvang.pdf" 
                    value={uploadPdf}
                    onChange={(e) => setUploadPdf(e.target.value)}
                  />
                </div>
              </div>

              {uploadType === 'documentsData' && (
                <div className="form-group">
                  <label htmlFor="up-ext">Đường dẫn Google Drive (Không bắt buộc)</label>
                  <input 
                    type="text" 
                    id="up-ext" 
                    className="form-input" 
                    placeholder="e.g. https://drive.google.com/file/d/..." 
                    value={uploadExternalUrl}
                    onChange={(e) => setUploadExternalUrl(e.target.value)}
                  />
                </div>
              )}

              <button type="submit" className="btn btn-primary w-full mt-2" disabled={uploadStatus === 'loading'}>
                <Upload size={16} />
                <span>Đăng Tải Lên Hệ Thống</span>
              </button>

              {uploadStatus === 'loading' && <div className="status-msg loading mt-3">Đang lưu trữ dữ liệu...</div>}
              
              {uploadStatus === 'success' && (
                <div className="status-msg success mt-3">
                  <CheckCircle size={15} />
                  <span>{uploadMsg}</span>
                </div>
              )}

              {uploadStatus === 'error' && (
                <div className="status-msg error mt-3">
                  <AlertCircle size={15} />
                  <span>{uploadMsg}</span>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
