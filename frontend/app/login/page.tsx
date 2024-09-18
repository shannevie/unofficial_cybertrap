import AcmeLogo from '@/app/ui/components/acme-logo';
import LoginForm from '@/app/ui/components/login-form';
 
export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col p-6">
      <div className="flex h-20 shrink-0 items-end rounded-lg bg-green-500 p-4 md:h-52">
        <AcmeLogo />
      </div>
        <LoginForm />
    </main>
  );
}

// 'use client';
// // pages/auth/signin.tsx
// import { signIn } from "next-auth/react";
// import { useState } from "react";

// export default function SignIn() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const res = await signIn("credentials", { email, password, redirect: false });
    
//     if (res?.error) {
//       setError(res.error);
//     } else {
//       window.location.href = "/dashboard";
//     }
//   };

//   return (
//     <div>
//       <h1>Sign In</h1>
//       {error && <p style={{ color: "red" }}>{error}</p>}
//       <form onSubmit={handleSubmit}>
//         <label>Email</label>
//         <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
//         <label>Password</label>
//         <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
//         <button type="submit">Sign In</button>
//       </form>
//     </div>
//   );
// }
