// hooks/useSellerAuth.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sellerApi } from '../services/api';
import toast from 'react-hot-toast';

const useSellerAuth = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const checkAccess = async () => {
            // 1. Token එක තියෙනවද?
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please login first');
                navigate('/login', { replace: true });
                return;
            }

            // 2. User Data එක localStorage එකෙන් ගන්න (role නැතුව)
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                toast.error('User data not found');
                navigate('/login', { replace: true });
                return;
            }

            let user;
            try {
                user = JSON.parse(userStr);
            } catch {
                toast.error('Invalid user data');
                navigate('/login', { replace: true });
                return;
            }

            // 3. User ID එක හොයාගන්න (user_id, id, userId)
            const userId = user.user_id || user.id || user.userId;
            
            if (!userId) {
                toast.error('User ID not found');
                navigate('/login', { replace: true });
                return;
            }

            // 🔥🔥 මෙතන `role` check එකක් නැහැ 🔥🔥
            // මොකද user table එකේ role column එක නැහැ

            // 4. Seller API එකෙන් status එක ගන්න
            try {
                const response = await sellerApi.getSellerByUserId(userId);
                
                // Response structure එක handle කරන්න (UserProfilePage එකේ තියෙන විදියට)
                const sellerData = response.data?.data || response.data;
                const status = sellerData?.status;

                // Status එක parseInt කරන්න (string විදියට ආවත් හරි)
                const statusCode = parseInt(status);

                // 5. Status එක අනුව තීරණ ගන්න
                if (statusCode === 1) {
                    // ✅ Approved Seller - Dashboard එකට ඉඩ දෙන්න
                    return;
                } else if (statusCode === 2) {
                    // ⏳ Pending
                    toast.success('Your seller application is pending approval.');
                    navigate('/pending', { replace: true });
                } else if (statusCode === 3) {
                    // ❌ Rejected
                    toast.error('Your application was rejected. Please re-apply.');
                    navigate('/profile', { replace: true });
                } else if (statusCode === 4) {
                    // 🔄 Re-application Pending
                    toast.info('Your re-application is under review.');
                    navigate('/pending', { replace: true });
                } else {
                    // Status එක නැතිනම් / null නම් -> Seller නෙවෙයි
                    toast.error('You are not registered as a seller.');
                    navigate('/profile', { replace: true });
                }
            } catch (error) {
                // API error එක
                console.error('Seller auth error:', error);
                
                if (error.response?.status === 404) {
                    // Seller record එකම නැති එක -> Seller නෙවෙයි
                    toast.error('You are not registered as a seller.');
                    navigate('/profile', { replace: true });
                } else {
                    // Network error හෝ Server error (500)
                    toast.error('Something went wrong. Please try again.');
                    navigate('/', { replace: true });
                }
            }
        };

        checkAccess();
    }, [navigate]);
};

export default useSellerAuth;