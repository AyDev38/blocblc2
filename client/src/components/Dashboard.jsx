import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const baseURI = import.meta.env.VITE_API_BASE_URL;

const AdminDashboard = () => {
  const [clientCount, setClientCount] = useState(0);
  const [vehicles, setVehicles] = useState([]);
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    marque: '',
    modele: '',
    annee: '',
    client_id: '',
    plaque: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [currentVehicleId, setCurrentVehicleId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClientCount();
    fetchVehicles();
    fetchClients();
  }, []);

  const fetchClientCount = async () => {
    try {
      const response = await fetch(baseURI + 'api/clients/count', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setClientCount(data.count);
      } else {
        alert('Erreur lors de la récupération du nombre de clients');
        navigate('/');
      }
    } catch (error) {
      alert('Erreur réseau');
      navigate('/');
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await fetch(baseURI + 'api/vehicles', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setVehicles(data);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch(baseURI + 'api/clients', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editMode ? 'PUT' : 'POST';
      const url = editMode ? `${baseURI}api/vehicles/${currentVehicleId}` : `${baseURI}api/vehicles`;
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        fetchVehicles();
        resetForm();
      } else {
        console.error('Erreur lors de la soumission du formulaire');
      }
    } catch (error) {
      console.error('Erreur réseau', error);
    }
  };

  const resetForm = () => {
    setFormData({
      marque: '',
      modele: '',
      annee: '',
      client_id: '',
      plaque: ''
    });
    setEditMode(false);
    setCurrentVehicleId(null);
  };

  const handleEdit = (vehicle) => {
    setFormData(vehicle);
    setEditMode(true);
    setCurrentVehicleId(vehicle.id);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${baseURI}api/vehicles/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchVehicles();
      } else {
        console.error('Erreur lors de la suppression du véhicule');
      }
    } catch (error) {
      console.error('Erreur réseau', error);
    }
  };

  return (
    <div className="admin-dashboard">
      <h2>Tableau de bord admin</h2>
      <p>Nombre de clients inscrits : {clientCount}</p>

      <div className="vehicle-management">
        <h3>Gestion des Véhicules</h3>
        <form onSubmit={handleSubmit}>
          <input type="text" name="marque" placeholder="Marque" value={formData.marque} onChange={handleChange} required />
          <input type="text" name="modele" placeholder="Modèle" value={formData.modele} onChange={handleChange} required />
          <input type="number" name="annee" placeholder="Année" value={formData.annee} onChange={handleChange} required />
          <select name="client_id" value={formData.client_id} onChange={handleChange} required>
            <option value="">Sélectionner un client</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.firstname} {client.lastname}</option>
            ))}
          </select>
          <input type="text" name="plaque" placeholder="Plaque" value={formData.plaque} onChange={handleChange} required />
          <button type="submit">{editMode ? 'Modifier' : 'Ajouter'}</button>
          {editMode && <button type="button" onClick={resetForm}>Annuler</button>}
        </form>

        <h3>Liste des Véhicules</h3>
        <ul>
          {vehicles.map(vehicle => (
            <li key={vehicle.id}>
              {vehicle.marque} {vehicle.modele} ({vehicle.annee}) - {vehicle.plaque}
              <button onClick={() => handleEdit(vehicle)}>Modifier</button>
              <button onClick={() => handleDelete(vehicle.id)}>Supprimer</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;
