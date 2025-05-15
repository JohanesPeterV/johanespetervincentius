'use client';
import { useParams } from 'next/navigation';
import { useState } from 'react';

export default function MessagePage() {
  const { name } = useParams() as { name: string };
  const greeting = `Dear, ${name}`;
  const content =
    'lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. ';
  const signature = 'Love, Peter';
  const password = 'cher';
  const [inputPassword, setInputPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPassword === password) {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="bg-card/50 backdrop-blur-sm rounded-xl border p-4 transition-colors duration-200 border-primary/50"
        >
          <h2 className="text-2xl font-bold mb-4">-</h2>
          <input
            type="password"
            value={inputPassword}
            onChange={(e) => setInputPassword(e.target.value)}
            className="border p-2 rounded mb-4 w-full"
            placeholder="Enter password"
          />
          <button
            type="submit"
            className="bg-primary/80 text-white px-4 py-2 rounded hover:bg-primary w-full"
          >
            Submit
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="text-2xl font-bold mb-4">{greeting}</div>
      <div className="mb-4">{content}</div>
      <div className="font-semibold">{signature}</div>
    </div>
  );
}
