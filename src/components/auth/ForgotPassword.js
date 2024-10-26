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
  
    try {
      const response = await axiosInstance.post('/api/password-reset/', { email });
      console.log('Respuesta del servidor:', response.data);
      setSuccess('Se han enviado las instrucciones a su correo electrónico.');
      setEmail(''); // Limpia el campo después de éxito
    } catch (err) {
      console.error('Error detallado:', err);
      
      if (err.code === 'ECONNABORTED') {
        setError('La operación está tomando más tiempo de lo esperado. Por favor, inténtelo nuevamente.');
      } else if (err.response) {
        setError(err.response.data?.error || 'Error al procesar la solicitud');
      } else if (err.request) {
        setError('No se pudo conectar con el servidor');
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
              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}
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
                  {isLoading ? 'Enviando...' : 'Restablecer contraseña'}
                </button>
              </form>
              <div className="mt-3 text-center">
                <Link to="/login">Volver al inicio de sesión</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;