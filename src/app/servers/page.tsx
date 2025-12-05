'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Server {
  id: number
  name: string
  url_api: string
  createdAt: string
}

export default function ServersPage() {
  const [servers, setServers] = useState<Server[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false) // ← TAMBAH
  const [serverToDelete, setServerToDelete] = useState<Server | null>(null) // ← TAMBAH
  const router = useRouter()

  useEffect(() => {
    fetchServers()
  }, [])

  const fetchServers = async () => {
    try {
      const response = await fetch('/api/servers')
      const data = await response.json()
      setServers(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

const handleAddServer = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  const formData = new FormData(e.currentTarget)
  
  try {
    const response = await fetch('/api/servers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: formData.get('name'),
        url_api: formData.get('url_api')
      })
    })

    // PERBAIKI: Cek status 201 (Created) bukan hanya ok
    if (response.status === 201) {
      fetchServers()
      setShowAddModal(false)
      const form = e.currentTarget
      form.reset()
    } else {
      // Tampilkan error detail
      const errorData = await response.json()
      console.error('Server error:', errorData)
      alert(`Failed to add server: ${errorData.error || 'Unknown error'}`)
    }
  } catch (error) {
    console.error('Network error:', error)
    alert('Network error. Check console for details.')
  }
}

  // FUNGSI DELETE SERVER ← TAMBAH INI
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/servers/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchServers() // Refresh list
        setShowDeleteModal(false)
        setServerToDelete(null)
      } else {
        const errorData = await response.json()
        alert(`Failed to delete: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error deleting server')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="text-white">Loading servers...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">🖥️ Servers List</h1>
          <p className="text-gray-400">List of all monitored servers</p>
          <Link 
            href="/dashboard" 
            className="text-blue-400 hover:text-blue-300 mt-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* ADD BUTTON */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            + Add Server
          </button>
        </div>

        {/* TABLE LIST */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="py-3 px-6 text-left text-gray-300">Name</th>
                <th className="py-3 px-6 text-left text-gray-300">API URL</th>
                <th className="py-3 px-6 text-left text-gray-300">Created</th>
                <th className="py-3 px-6 text-left text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {servers.map((server) => (
                <tr key={server.id} className="border-b border-gray-700">
                  <td className="py-4 px-6">
                    <Link 
                      href={`/server/${server.id}`}
                      className="text-white hover:text-blue-400"
                    >
                      {server.name}
                    </Link>
                  </td>
                  <td className="py-4 px-6">
                    <code className="bg-gray-900 px-2 py-1 rounded text-sm text-gray-300">
                      {server.url_api}
                    </code>
                  </td>
                  <td className="py-4 px-6 text-gray-400">
                    {new Date(server.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => {
                        setServerToDelete(server)
                        setShowDeleteModal(true)
                      }}
                      className="px-3 py-1 bg-red-900/30 text-red-400 rounded text-sm hover:bg-red-800/40"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MODAL ADD SERVER */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">Add New Server</h2>
              
              <form onSubmit={handleAddServer}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-2">Server Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white"
                      placeholder="My Production Server"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">API URL</label>
                    <input
                      type="url"
                      name="url_api"
                      required
                      className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white"
                      placeholder="http://192.168.1.100:5000/metrics"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                  >
                    Add Server
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL DELETE CONFIRMATION ← TAMBAH INI */}
        {showDeleteModal && serverToDelete && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">Delete Server</h2>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete <strong className="text-white">{serverToDelete.name}</strong>?
                <br />
                <span className="text-sm text-gray-400">This action cannot be undone.</span>
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setServerToDelete(null)
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(serverToDelete.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                >
                  Delete Server
                </button>
              </div>
            </div>
          </div>
        )}

        {/* INFO */}
        <div className="mt-8 text-gray-500 text-sm">
          <p>Total Servers: {servers.length}</p>
          <p className="mt-2">Click server name to view details</p>
        </div>

      </div>
    </div>
  )
}