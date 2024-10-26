import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
  
    // Log para debugging
    console.log('Intentando enviar solicitud a:', `${axiosInstance.defaults.baseURL}/api/password-reset/`);
    
    try {
      // Asegurarse que la URL comience con /api/
      const response = await axiosInstance.post('api/password-reset/', { 
        email: email 
      });
      
      console.log('Respuesta del servidor:', response);
      setSuccess('Se han enviado las instrucciones a su correo electrónico.');
      setEmail('');
    } catch (err) {
      console.error('URL completa:', `${axiosInstance.defaults.baseURL}/api/password-reset/`);
      console.error('Error completo:', err);
      console.error('Estado de la respuesta:', err.response?.status);
      console.error('Datos del error:', err.response?.data);
      
      if (err.code === 'ECONNABORTED') {
        setError('La operación está tomando más tiempo de lo esperado. Por favor, inténtelo nuevamente.');
      } else if (err.response) {
        // Manejar diferentes códigos de estado
        switch (err.response.status) {
          case 404:
            setError('La ruta de restablecimiento de contraseña no está disponible.');
            break;
          case 400:
            setError(err.response.data?.error || 'Datos inválidos en la solicitud.');
            break;
          case 500:
            setError('Error en el servidor. Por favor, intente más tarde.');
            break;
          default:
            setError(err.response.data?.error || 'Error al procesar la solicitud');
        }
      } else if (err.request) {
        setError('No se pudo conectar con el servidor. Verifique su conexión.');
      } else {
        setError('Error al enviar la solicitud');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">¿Has olvidado tu contraseña?</h2>
              {error && (
                <div className="alert alert-danger">
                  <strong>Error:</strong> {error}
                </div>
              )}
              {success && (
                <div className="alert alert-success">
                  <strong>¡Éxito!</strong> {success}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Correo electrónico</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    placeholder="Ingrese su correo electrónico"
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary w-100"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Enviando...
                    </>
                  ) : (
                    'Restablecer contraseña'
                  )}
                </button>
              </form>
              <div className="mt-3 text-center">
                <Link to="/login" className="text-decoration-none">
                  Volver al inicio de sesión
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;