import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { API_BASE_URL } from '../config';

const defaultForm = {
  name: '',
  phone: '',
  email: '',
  address: '',
  loyaltyPoints: 0,
  vip: false,
  notes: ''
};

const formatPoints = (value) => `${Number(value || 0).toLocaleString()} pts`;

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(defaultForm);
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      const { data } = await axios.get(`${API_BASE_URL}/api/customers?${params}`);
      setCustomers(data);
    } catch (error) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const filteredCustomers = useMemo(() => {
    if (!search.trim()) return customers;
    const query = search.toLowerCase();
    return customers.filter((customer) => {
      const values = [customer.name, customer.phone, customer.email, customer.address];
      return values.some((value) => String(value || '').toLowerCase().includes(query));
    });
  }, [customers, search]);

  const stats = useMemo(() => {
    const total = customers.length;
    const vip = customers.filter((customer) => customer.vip).length;
    const points = customers.reduce((sum, customer) => sum + Number(customer.loyaltyPoints || 0), 0);

    return {
      total,
      vip,
      points
    };
  }, [customers]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Customer name is required');
      return;
    }

    const customerPayload = {
      ...formData,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      notes: formData.notes.trim(),
      loyaltyPoints: Number(formData.loyaltyPoints || 0),
      vip: Boolean(formData.vip)
    };

    try {
      if (editing) {
        await axios.put(`${API_BASE_URL}/api/customers/${editing._id}`, customerPayload);
        toast.success('Customer updated');
      } else {
        await axios.post(`${API_BASE_URL}/api/customers`, customerPayload);
        toast.success('Customer added');
      }

      setShowModal(false);
      setEditing(null);
      setFormData(defaultForm);
      fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save customer');
    }
  };

  const handleEdit = (customer) => {
    setEditing(customer);
    setFormData({
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      loyaltyPoints: customer.loyaltyPoints || 0,
      vip: !!customer.vip,
      notes: customer.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/customers/${id}`);
      toast.success('Customer deleted');
      fetchCustomers();
    } catch (error) {
      toast.error('Failed to delete customer');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Customers</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Track customer contact details and loyalty activity.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setFormData(defaultForm);
            setShowModal(true);
          }}
          className="inline-flex items-center justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Add Customer
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-white p-4 shadow dark:bg-gray-800">
          <p className="text-sm text-gray-500">Total Customers</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow dark:bg-gray-800">
          <p className="text-sm text-gray-500">VIP Customers</p>
          <p className="mt-2 text-3xl font-bold text-violet-600">{stats.vip}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow dark:bg-gray-800">
          <p className="text-sm text-gray-500">Total Loyalty Points</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{formatPoints(stats.points)}</p>
        </div>
      </div>

      <div className="rounded-xl bg-white p-4 shadow dark:bg-gray-800">
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">Search</label>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone, email or address..."
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
        />
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Loyalty</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
            {filteredCustomers.map((customer) => (
              <tr key={customer._id || customer.id}>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                  <div className="font-medium">{customer.name}</div>
                  {customer.address && <div className="mt-1 text-xs text-gray-500">{customer.address}</div>}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="h-4 w-4" />
                    {customer.phone || '—'}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                    <EnvelopeIcon className="h-4 w-4" />
                    {customer.email || '—'}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                  {formatPoints(customer.loyaltyPoints || 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      customer.vip ? 'bg-violet-100 text-violet-800' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {customer.vip ? 'VIP' : 'Standard'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button type="button" onClick={() => handleEdit(customer)} className="mr-4 text-primary-600 hover:text-primary-900">
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button type="button" onClick={() => handleDelete(customer._id || customer.id)} className="text-red-600 hover:text-red-900">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredCustomers.length === 0 && (
          <div className="py-10 text-center text-gray-500">No customers found</div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle">&#8203;</span>
            <div className="inline-block w-full max-w-xl transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all dark:bg-gray-800 sm:my-8 sm:align-middle">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pb-4 pt-5 dark:bg-gray-800 sm:p-6">
                  <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                    {editing ? 'Edit Customer' : 'New Customer'}
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">Customer Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">Phone</label>
                        <input
                          type="text"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">Address</label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">Loyalty Points</label>
                        <input
                          type="number"
                          min="0"
                          value={formData.loyaltyPoints}
                          onChange={(e) => setFormData({ ...formData, loyaltyPoints: Number(e.target.value) || 0 })}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                        />
                      </div>
                      <div className="flex items-center pt-7">
                        <input
                          id="vip"
                          type="checkbox"
                          checked={formData.vip}
                          onChange={(e) => setFormData({ ...formData, vip: e.target.checked })}
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <label htmlFor="vip" className="ml-2 block text-sm text-gray-700 dark:text-gray-200">
                          VIP customer
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">Notes</label>
                      <textarea
                        rows="3"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-row-reverse gap-3 bg-gray-50 px-4 py-3 dark:bg-gray-900 sm:px-6">
                  <button
                    type="submit"
                    className="inline-flex justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700"
                  >
                    {editing ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditing(null);
                      setFormData(defaultForm);
                    }}
                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
