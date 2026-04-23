import { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../api/api';

export default function UserProfile({ userId }) {
  const [model, setModel] = useState(null);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    age: '',
    salary: '',
    relationshipStatus: '',
  });

  useEffect(() => {
    if (userId) {
      getProfile(userId)
        .then((data) => {
          setModel(data);
          setForm({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            age: data.age || '',
            salary: data.salary || '',
            relationshipStatus: data.relationshipStatus || '',
          });
        })
        .catch((err) => {
          console.error('Failed to fetch user profile:', err);
        });
    }
  }, [userId]);

  const save = async (e) => {
    debugger;
    e.preventDefault();
    if (
      !userId ||
      !form.firstName ||
      !form.lastName ||
      !form.age ||
      !form.salary ||
      !form.relationshipStatus
    ) {
      alert('Please fill in all required fields.');
      return;
    }

    if (
      model.firstName === form.firstName &&
      model.lastName === form.lastName &&
      model.age === form.age &&
      model.salary === form.salary &&
      model.relationshipStatus === form.relationshipStatus &&
      !file
    ) {
      alert('No changes detected.');
      return;
    }

    await updateProfile(userId, form);
    await getProfile(userId).then(setModel);

    alert('Profile updated successfully!');
  };

  return (
    <div>
      <h2>User Profile</h2>
      <form onSubmit={save}>
        <div>
          <label>First Name:</label>
          <input
            type="text"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          />
        </div>
        <div>
          <label>Last Name:</label>
          <input
            type="text"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          />
        </div>
        <div>
          <label>Age:</label>
          <input
            type="number"
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
          />
        </div>
        <div>
          <label>Salary:</label>
          <input
            type="number"
            value={form.salary}
            onChange={(e) => setForm({ ...form, salary: e.target.value })}
          />
        </div>
        <div>
          <label>Relationship Status:</label>
          <select
            value={form.relationshipStatus}
            onChange={(e) =>
              setForm({ ...form, relationshipStatus: e.target.value })
            }
          >
            <option value="">Select Status</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
          </select>
        </div>
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
}
