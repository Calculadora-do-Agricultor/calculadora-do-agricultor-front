"use client"

import { useState, useContext, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"
import { doc, setDoc } from "firebase/firestore"
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth"
import { auth, db } from "../../services/firebaseConfig"
import {
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline"
import Alert from "../../components/Alert/Alert"

const Register = () => {
  const navigate = useNavigate()
  const { user: authUser, loading: authLoading } = useContext(AuthContext)
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role] = useState("user")
  const [errorMessage, setErrorMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formTouched, setFormTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  })

  // Password validation states
  const hasMinLength = password.length >= 6
  const hasUpperCase = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const passwordsMatch = password === confirmPassword && confirmPassword !== ""

  const validateForm = () => {
    if (!name.trim()) {
      setErrorMessage("Por favor, insira seu nome.")
      return false
    }

    if (!email.trim()) {
      setErrorMessage("Por favor, insira seu email.")
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setErrorMessage("Por favor, insira um email válido.")
      return false
    }

    if (!password.trim()) {
      setErrorMessage("Por favor, insira uma senha.")
      return false
    }

    if (password.length < 6) {
      setErrorMessage("A senha deve ter pelo menos 6 caracteres.")
      return false
    }

    if (!/[A-Z]/.test(password)) {
      setErrorMessage("A senha deve conter pelo menos uma letra maiúscula.")
      return false
    }

    if (!/[0-9]/.test(password)) {
      setErrorMessage("A senha deve conter pelo menos um número.")
      return false
    }

    if (password !== confirmPassword) {
      setErrorMessage("As senhas não coincidem.")
      return false
    }

    return true
  }

  const [createUserWithEmailAndPassword, firebaseUser, firebaseLoading, firebaseError] =
    useCreateUserWithEmailAndPassword(auth)

  const handleRegister = async (e) => {
    e.preventDefault()

    setErrorMessage("")
    setIsLoading(true)

    if (!validateForm()) {
      setIsLoading(false)
      return
    }

    try {
      const result = await createUserWithEmailAndPassword(email, password)
      console.log("Cadastro realizado com sucesso!", result.user)

      if (result && result.user) {
        const uid = result.user.uid

        await setDoc(doc(db, "users", uid), {
          name: name,
          email: email,
          createdAt: new Date(),
          role: "user",
          env: import.meta.env.VITE_ENV || "dev",
        })

        localStorage.setItem("authToken", "logado")
        navigate("/Calculator")
        console.log("Usuário registrado e salvo no Firestore.")
      }
    } catch (err) {
      let errorMsg
      switch (err.code) {
        case "auth/email-already-in-use":
          errorMsg = "Este email já está em uso."
          break
        case "auth/invalid-email":
          errorMsg = "Email inválido."
          break
        case "auth/network-request-failed":
          errorMsg = "Erro de conexão. Verifique sua internet e tente novamente."
          break
        case "auth/weak-password":
          errorMsg = "A senha é muito fraca. Tente uma senha mais forte."
          break
        default:
          errorMsg = "Erro ao criar conta. Tente novamente."
      }
      setErrorMessage(errorMsg)
      console.error("Erro ao salvar no Firestore:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && authUser) {
      navigate("/Calculator", { replace: true })
    }
  }, [authUser, authLoading, navigate])

  const handleInputFocus = (field) => {
    setFormTouched((prev) => ({ ...prev, [field]: true }))
  }

  if (firebaseLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px-40px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-4 text-blue-800 font-medium">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center bg-white px-4 min-h-[calc(100vh-64px-40px)] py-8">
      <div className="bg-blue-100 p-8 md:p-12 rounded-2xl shadow-xl w-full max-w-md space-y-4 border border-blue-200">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-blue-800">Cadastre-se</h2>
          <div className="mt-3">
            <h3 className="text-lg text-blue-700 font-semibold">Bem-vindo à Calculadora do Agricultor!</h3>
            <p className="text-sm text-gray-600">Preencha os dados abaixo para criar sua conta.</p>
          </div>
        </div>

        <form onSubmit={handleRegister} className="space-y-4 mt-6">
          <div className="space-y-1">
            <label htmlFor="name" className="block text-sm font-medium text-blue-800">
              Nome
            </label>
            <div className="relative">
              <input
                id="name"
                type="text"
                value={name}
                placeholder="Seu nome completo"
                className="w-full p-3 pl-10 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                onChange={(e) => setName(e.target.value)}
                onFocus={() => handleInputFocus("name")}
                required
              />
              <UserIcon className="w-5 h-5 text-gray-500 absolute left-3 top-3.5" />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium text-blue-800">
              Email
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                value={email}
                placeholder="seu@email.com"
                className="w-full p-3 pl-10 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => handleInputFocus("email")}
                required
              />
              <EnvelopeIcon className="w-5 h-5 text-gray-500 absolute left-3 top-3.5" />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-medium text-blue-800">
              Senha
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                placeholder="Sua senha"
                className="w-full p-3 pl-10 pr-10 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 hover:border-blue-500"
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => handleInputFocus("password")}
                required
                minLength={6}
              />
              <LockClosedIcon className="w-5 h-5 text-gray-500 absolute left-3 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-500 hover:text-blue-600 transition-colors duration-200"
                tabIndex="-1"
                aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>

            {formTouched.password && (
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex items-center">
                  {hasMinLength ? (
                    <CheckCircleIcon className="w-4 h-4 text-green-600 mr-1" />
                  ) : (
                    <XCircleIcon className="w-4 h-4 text-red-600 mr-1" />
                  )}
                  <span className={hasMinLength ? "text-green-600" : "text-red-600"}>Mínimo de 6 caracteres</span>
                </div>
                <div className="flex items-center">
                  {hasUpperCase ? (
                    <CheckCircleIcon className="w-4 h-4 text-green-600 mr-1" />
                  ) : (
                    <XCircleIcon className="w-4 h-4 text-red-600 mr-1" />
                  )}
                  <span className={hasUpperCase ? "text-green-600" : "text-red-600"}>
                    Pelo menos uma letra maiúscula
                  </span>
                </div>
                <div className="flex items-center">
                  {hasNumber ? (
                    <CheckCircleIcon className="w-4 h-4 text-green-600 mr-1" />
                  ) : (
                    <XCircleIcon className="w-4 h-4 text-red-600 mr-1" />
                  )}
                  <span className={hasNumber ? "text-green-600" : "text-red-600"}>Pelo menos um número</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-blue-800">
              Confirme a Senha
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                placeholder="Confirme sua senha"
                className="w-full p-3 pl-10 pr-10 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 hover:border-blue-500"
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => handleInputFocus("confirmPassword")}
                required
                minLength={6}
              />
              <LockClosedIcon className="w-5 h-5 text-gray-500 absolute left-3 top-3.5" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3.5 text-gray-500 hover:text-blue-600 transition-colors duration-200"
                tabIndex="-1"
                aria-label={showConfirmPassword ? "Esconder senha" : "Mostrar senha"}
              >
                {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
            {formTouched.confirmPassword && confirmPassword && (
              <div className="mt-2 flex items-center text-sm">
                {passwordsMatch ? (
                  <>
                    <CheckCircleIcon className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-green-600">Senhas coincidem</span>
                  </>
                ) : (
                  <>
                    <XCircleIcon className="w-4 h-4 text-red-600 mr-1" />
                    <span className="text-red-600">Senhas não coincidem</span>
                  </>
                )}
              </div>
            )}
          </div>

          {errorMessage && <Alert type="error" message={errorMessage} onClose={() => setErrorMessage("")} />}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full ${
                isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-700 hover:bg-blue-800"
              } text-white py-3 rounded-lg font-semibold text-lg transition`}
            >
              {isLoading ? "Registrando..." : "Registrar"}
            </button>
          </div>

          <div className="text-center text-sm text-gray-600 pt-2">
            Já tem uma conta?{" "}
            <Link to="/login" className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
              Faça login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register
