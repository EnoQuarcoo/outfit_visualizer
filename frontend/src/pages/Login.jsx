import React, { useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import { supabase } from "../SupabaseClient";
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router'
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("");
        navigate('/wardrobe'); 
        
      }
    } catch (err) {
        setErrorMessage(err.message);
    } finally {
        setIsLoading(false);
    }
  };

  const handleGoogleSubmit = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  };

  return (
    <div className="login-page">
      {/* Create email field */}
      <Input
        type="email"
        placeholder="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setErrorMessage("");

        }}
      />
      {/* Create password field */}
      <Input
        type="password"
        placeholder="password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          setErrorMessage("");

        }}
      />

      <Button text="Submit" onClick={handleSubmit} disabled={isLoading} />
      <Button
        text="Sign in with Google"
        onClick={handleGoogleSubmit}
        disabled={isLoading}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.29-8.16 2.29-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
        }
      />
      <div className="login-error"> {errorMessage && <p>{errorMessage}</p>}</div>
      <p className="login-signup-prompt">
        Don't have an account? <Link to="/signup" className="login-signup-link">Sign up</Link>
      </p>
    </div>
  );
};

export default Login;
