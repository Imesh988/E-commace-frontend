import React, { useState } from 'react';
import { auth } from './firebaseConfig';
import { sendPasswordResetEmail } from "firebase/auth";


function ForgotPassword () {
    const [email , setEmail] = useState('');
    const [ message , setMessage] = useState('');

    const handleReset= async (e) => {
        e.preventDefault();

        try {
            await sendPasswordResetEmail(auth , email)
            setMessage('Password reset email sent!')
        } catch (error) {
            setMessage("Error: " + error.message)
        }
    }

    return (
         <div>
            <h2>Forgot Password</h2>
            <form onSubmit={handleReset}>
                <input 
                    type="email" 
                    placeholder="Enter your email" 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                />
                <button type="submit">Reset Password</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    )
}

export default ForgotPassword;