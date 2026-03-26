import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";
import { FcGoogle } from "react-icons/fc";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState("");

  const { session, signInUser, signInGoogle } = UserAuth();
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signInUser(email, password);

      if (result.success) {
      }
    } catch (err) {
      setError("an error occured");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignInGoogle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signInGoogle();
      if (result.success) {
      }
    } catch (err) {
      setError("an error occured");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSignIn} className="max-w-md m-auto pt-24">
        <h2 className="font-bold pb-2">Sign in</h2>
        <p>
          Don't have an account? <Link to="/signup">Sign up!</Link>
        </p>
        <div className="flex flex-col py-4">
          <input
            onChange={(e) => setEmail(e.target.value)}
            placeholde="Email"
            className="p-3 mt-6"
            type="email"
          />
          <input
            onChange={(e) => setPassword(e.target.value)}
            placeholde="Password"
            className="p-3 mt-6"
            type="password"
          />
          <button type="submit" disabled={loading} className="mt-6 w-full">
            Sign in
          </button>
          <button
            onClick={handleSignInGoogle}
            disabled={loading}
            className="mt-2 w-full"
          >
            <p className="text-center"> Sign in with Google</p>
          </button>
          {error && <p className="text-red-600 text-center pt-4">{error}</p>}
        </div>
      </form>
    </div>
  );
};

export default Signin;
