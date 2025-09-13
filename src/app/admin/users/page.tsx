'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { 
  Users, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Shield,
  Map,
  User,
  Mail,
  Phone,
  Calendar,
  Loader2
} from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: 'admin' | 'tour_leader' | 'pelanggan'
  avatar_url: string | null
  created_at?: string // Optional since it might not exist
}

interface EditUserForm {
  full_name: string
  phone: string
  role: 'admin' | 'tour_leader' | 'pelanggan'
}

/**
 * Admin Users Management Page
 * 
 * Features:
 * - View all users with search and role filtering
 * - Edit user information (name, phone, role)
 * - Delete users (with confirmation)
 * - Role management (upgrade/downgrade user roles)
 * 
 * Note: User creation is handled through the registration page
 */
export default function AdminUsersPage() {
  console.log('Component render triggered') // Debug log
  
  // State Management
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  
  // Modal States
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  
  // Form States
  const [editForm, setEditForm] = useState<EditUserForm>({
    full_name: '',
    phone: '',
    role: 'pelanggan'
  })
  
  const [actionLoading, setActionLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false) // Prevent multiple fetches
  
  // Memoize supabase client to prevent recreating on every render
  const supabase = useMemo(() => createClient(), [])

  // Fetch Users - with duplicate fetch prevention  
  const fetchUsers = async () => {
    if (isFetching) {
      console.log('Fetch skipped - already fetching')
      return
    }
    
    try {
      setIsFetching(true)
      setLoading(true)
      console.log('Fetching users...') // Debug log
      
      // Try direct query first
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false, nullsFirst: false })
      
      if (error) {
        console.error('Error fetching users:', error)
        
        // If RLS is blocking, try via API route
        if (error.code === '42501' || error.message.includes('permission denied')) {
          console.log('RLS blocking direct query, trying API route...')
          
          const response = await fetch('/api/admin/get-users')
          const result = await response.json()
          
          if (response.ok) {
            setUsers(result.users || [])
            console.log('Users fetched via API:', result.users?.length || 0)
            return
          }
        }
        
        toast.error(`Gagal memuat data user: ${error.message}`)
        return
      }
      
      console.log('Users fetched successfully:', data?.length || 0) // Debug log
      setUsers(data || [])
    } catch (error) {
      console.error('Exception fetching users:', error)
      toast.error('Terjadi kesalahan saat memuat data user')
    } finally {
      setLoading(false)
      setIsFetching(false)
    }
  }

  // Initial load - only run once on mount
  useEffect(() => {
    console.log('Component mounted - fetching users')
    fetchUsers()
  }, []) // Empty dependency array

  // Memoize filtered users untuk performa yang lebih baik
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = !searchTerm || 
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter
      
      return matchesSearch && matchesRole
    })
  }, [users, searchTerm, roleFilter])

  // Edit User
  const handleEditUser = async () => {
    if (!selectedUser || !editForm.full_name) {
      toast.error('Nama lengkap harus diisi')
      return
    }

    setActionLoading(true)
    try {
      const response = await fetch('/api/admin/update-user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedUser.id,
          full_name: editForm.full_name,
          phone: editForm.phone,
          role: editForm.role
        })
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('User update error:', result)
        toast.error(`Gagal mengupdate user: ${result.error || 'Unknown error'}`)
        return
      }

      toast.success('User berhasil diupdate!')
      fetchUsers() // Refresh list
      setShowEditModal(false)
      setSelectedUser(null)
    } catch (error) {
      console.error('Exception updating user:', error)
      toast.error('Terjadi kesalahan saat mengupdate user')
    } finally {
      setActionLoading(false)
    }
  }

  // Delete User
  const handleDeleteUser = async () => {
    if (!selectedUser) return

    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/update-user?id=${selectedUser.id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('User deletion error:', result)
        toast.error(`Gagal menghapus user: ${result.error || 'Unknown error'}`)
        return
      }

      toast.success('User berhasil dihapus!')
      fetchUsers() // Refresh list
      setShowDeleteModal(false)
      setSelectedUser(null)
    } catch (error) {
      console.error('Exception deleting user:', error)
      toast.error('Terjadi kesalahan saat menghapus user')
    } finally {
      setActionLoading(false)
    }
  }

  // Open Edit Modal
  const openEditModal = (user: UserProfile) => {
    setSelectedUser(user)
    setEditForm({
      full_name: user.full_name || '',
      phone: user.phone || '',
      role: user.role
    })
    setShowEditModal(true)
  }

  // Open Delete Modal
  const openDeleteModal = (user: UserProfile) => {
    setSelectedUser(user)
    setShowDeleteModal(true)
  }

  // Role Badge Component
  const RoleBadge = ({ role }: { role: string }) => {
    const variants = {
      admin: { className: 'bg-red-100 text-red-800 border-red-200', icon: Shield, label: 'Admin' },
      tour_leader: { className: 'bg-blue-100 text-blue-800 border-blue-200', icon: Map, label: 'Tour Leader' },
      pelanggan: { className: 'bg-green-100 text-green-800 border-green-200', icon: User, label: 'Pelanggan' }
    }
    
    const variant = variants[role as keyof typeof variants] || variants.pelanggan
    const IconComponent = variant.icon
    
    return (
      <Badge className={variant.className}>
        <IconComponent className="w-3 h-3 mr-1" />
        {variant.label}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Users className="mr-3 h-8 w-8 text-green-600" />
            Kelola User
          </h1>
          <p className="mt-2 text-gray-600">
            Kelola semua user, ubah role, dan atur akses sistem. 
          </p>
          <p className="text-sm text-gray-500 mt-1">
            💡 Untuk menambah user baru, arahkan ke halaman register
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter & Pencarian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <Label htmlFor="search" className="text-sm font-medium text-gray-700">
                Cari User
              </Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Cari berdasarkan nama atau email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Role Filter */}
            <div>
              <Label htmlFor="role-filter" className="text-sm font-medium text-gray-700">
                Filter Role
              </Label>
              <div className="mt-1">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Role</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="tour_leader">Tour Leader</SelectItem>
                    <SelectItem value="pelanggan">Pelanggan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Daftar User ({filteredUsers.length} dari {users.length} user)
          </CardTitle>
          <CardDescription>
            Kelola semua user yang terdaftar di sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              <span className="ml-2 text-gray-600">Memuat data user...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Kontak</TableHead>
                    <TableHead>Terakhir Update</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        {searchTerm || roleFilter !== 'all' 
                          ? 'Tidak ada user yang sesuai dengan filter'
                          : 'Belum ada user terdaftar'
                        }
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {user.full_name || 'Nama tidak diset'}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <Mail className="w-3 h-3 mr-1" />
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <RoleBadge role={user.role} />
                        </TableCell>
                        <TableCell>
                          {user.phone ? (
                            <div className="text-sm flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {user.phone}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Tidak ada</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {user.created_at ? (
                              new Date(user.created_at).toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: 'short', 
                                year: 'numeric'
                              })
                            ) : (
                              <span className="text-gray-400">Baru</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditModal(user)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDeleteModal(user)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              disabled={user.role === 'admin'} // Prevent deleting admin
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md sm:max-w-lg z-[100] bg-white border border-gray-200 shadow-2xl">
          <DialogHeader className="space-y-3">
            <DialogTitle className="flex items-center text-xl font-semibold">
              <Edit3 className="mr-2 h-5 w-5 text-blue-600" />
              Edit User
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Edit informasi user: <span className="font-medium">{selectedUser?.full_name}</span> ({selectedUser?.email})
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-5 py-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-sm font-medium text-gray-700">
                Nama Lengkap <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-name"
                placeholder="Nama lengkap user"
                value={editForm.full_name}
                onChange={(e) => setEditForm(prev => ({
                  ...prev,
                  full_name: e.target.value
                }))}
                className="w-full"
              />
            </div>
            
            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="edit-phone" className="text-sm font-medium text-gray-700">
                Nomor Telepon
              </Label>
              <Input
                id="edit-phone"
                placeholder="08123456789"
                value={editForm.phone}
                onChange={(e) => setEditForm(prev => ({
                  ...prev,
                  phone: e.target.value
                }))}
                className="w-full"
              />
            </div>
            
            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="edit-role" className="text-sm font-medium text-gray-700">
                Role <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={editForm.role} 
                onValueChange={(value: string) => setEditForm(prev => ({
                  ...prev,
                  role: value as EditUserForm['role']
                }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pelanggan">
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Pelanggan
                    </div>
                  </SelectItem>
                  <SelectItem value="tour_leader">
                    <div className="flex items-center">
                      <Map className="mr-2 h-4 w-4" />
                      Tour Leader
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center">
                      <Shield className="mr-2 h-4 w-4" />
                      Admin
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {editForm.role !== selectedUser?.role && (
              <Alert className="border-orange-200 bg-orange-50">
                <Shield className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>Perhatian:</strong> Anda akan mengubah role dari{' '}
                  <span className="font-semibold">{selectedUser?.role}</span> menjadi{' '}
                  <span className="font-semibold">{editForm.role}</span>
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => setShowEditModal(false)}
              className="w-full sm:w-auto"
              disabled={actionLoading}
            >
              Batal
            </Button>
            <Button 
              onClick={handleEditUser}
              disabled={actionLoading}
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Simpan Perubahan
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-md sm:max-w-lg z-[100] bg-white border border-gray-200 shadow-2xl">
          <DialogHeader className="space-y-3">
            <DialogTitle className="flex items-center text-xl font-semibold text-red-600">
              <Trash2 className="mr-2 h-5 w-5" />
              Hapus User
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait user.
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="py-4">
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  <div className="space-y-3">
                    <div className="font-medium text-base">Detail user yang akan dihapus:</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">Nama:</span> 
                        <span>{selectedUser.full_name || 'Tidak diset'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Email:</span> 
                        <span>{selectedUser.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Role:</span> 
                        <span className="capitalize">{selectedUser.role.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-red-100 rounded border border-red-200">
                      <div className="font-semibold text-red-900">
                        ⚠️ Yakin ingin menghapus user ini secara permanen?
                      </div>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteModal(false)}
              className="w-full sm:w-auto"
              disabled={actionLoading}
            >
              Batal
            </Button>
            <Button 
              onClick={handleDeleteUser}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Ya, Hapus User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}