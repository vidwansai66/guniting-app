import React, { createContext, useState, useContext } from 'react';

const DbContext = createContext();

export const useDb = () => useContext(DbContext);

export const DbProvider = ({ children }) => {
    // Mock Tables
    const [users, setUsers] = useState([
        { id: 1, name: 'Admin User', phone: '9999999999', role: 'admin', isActive: true },
        { id: 2, name: 'Raju Contractor', phone: '8888888888', role: 'contractor', isActive: true },
        { id: 3, name: 'Vikram Owner', phone: '7777777777', role: 'owner', isActive: true },
        { id: 4, name: 'Suresh Worker', phone: '6666666666', role: 'worker', isActive: true },
    ]);

    const [machines, setMachines] = useState([
        { id: 1, owner_id: 3, machine_type: 'Static Concrete Pump', location: 'Mumbai', price_per_day: '₹12,000', availability_status: true },
        { id: 2, owner_id: 3, machine_type: 'Boom Pump (36m)', location: 'Pune', price_per_day: '₹25,000', availability_status: false },
        { id: 3, owner_id: 99, machine_type: 'Line Pump', location: 'Thane', price_per_day: '₹15,000', availability_status: true },
    ]);

    const [workers, setWorkers] = useState([
        { id: 1, user_id: 4, skill_type: 'Nozzleman', experience_years: 5, location: 'Mumbai', daily_rate: '₹1,500', availability_status: true },
    ]);

    const [contactRequests, setContactRequests] = useState([]);

    // Current Auth State
    const [currentUser, setCurrentUser] = useState(null);

    // Db Actions
    const loginWithPhone = (phone) => {
        const user = users.find(u => u.phone === phone);
        if (user && user.isActive) {
            setCurrentUser(user);
            return user;
        }
        return null; // Not found or inactive
    };

    const registerUser = (userDto) => {
        const newUser = { id: Date.now(), ...userDto, isActive: true };
        setUsers([...users, newUser]);
        // If they register as a worker, create an empty worker profile
        if (newUser.role === 'worker') {
            setWorkers([...workers, { id: Date.now(), user_id: newUser.id, skill_type: '', experience_years: 0, location: '', daily_rate: '', availability_status: true }]);
        }
        setCurrentUser(newUser);
        return newUser;
    };

    const logout = () => setCurrentUser(null);

    // Machine Actions
    const addMachine = (machineDto) => {
        setMachines([...machines, { id: Date.now(), owner_id: currentUser.id, ...machineDto }]);
    };
    const updateMachine = (id, updates) => {
        setMachines(machines.map(m => m.id === id ? { ...m, ...updates } : m));
    };
    const deleteMachine = (id) => {
        setMachines(machines.filter(m => m.id !== id));
    };

    // Worker Actions
    const updateWorkerProfile = (updates) => {
        setWorkers(workers.map(w => w.user_id === currentUser.id ? { ...w, ...updates } : w));
    };

    // Contact Requests
    const logRequest = (target_type, target_id) => {
        if (currentUser?.role === 'contractor') {
            setContactRequests([...contactRequests, {
                id: Date.now(),
                contractor_id: currentUser.id,
                target_type,
                target_id,
                timestamp: new Date().toISOString()
            }]);
        }
    };

    // Admin Actions
    const deactivateUser = (id) => {
        setUsers(users.map(u => u.id === id ? { ...u, isActive: false } : u));
        if (id === currentUser?.id) logout();
    };

    return (
        <DbContext.Provider value={{
            users, machines, workers, contactRequests,
            currentUser, loginWithPhone, registerUser, logout,
            addMachine, updateMachine, deleteMachine,
            updateWorkerProfile, logRequest, deactivateUser
        }}>
            {children}
        </DbContext.Provider>
    );
};
