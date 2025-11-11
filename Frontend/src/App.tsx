import { BrowserRouter, Route, Routes } from "react-router-dom"
import Navbar from "./components/Navbar"
import NewPassword from "./pages/NewPassword"
import Home from "./pages/Home"
import ResetPassword from "./pages/ResetPassword"
import VerifyOtp from "./pages/VerifyOtp"
import ChangePassword from "./pages/ChangePassword"
import Login from "./pages/Login"
import Register from "./pages/Register"
import VerifyEmailPage from "./pages/VerifyEmailPage"


const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Navbar />
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/register" element={<Register />}/>
        <Route path="/login" element={<Login />}/>
        <Route path="/change-password" element={<ChangePassword />}/>
        <Route path="/verify-otp" element={<VerifyOtp />}/>
        <Route path="/reset-password" element={<ResetPassword />}/>
        <Route path="/new-password" element={<NewPassword />}/>
        <Route path="/verify" element={<VerifyEmailPage />}/>
      </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App