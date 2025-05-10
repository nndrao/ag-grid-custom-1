import { useState, useCallback } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useProfile } from '@/contexts/profile-context';
import { formatDistanceToNow } from 'date-fns';
import React from 'react';

interface ProfileManagerProps {
  onClose: () => void;
}

export const ProfileManager = React.memo(function ProfileManager({ onClose }: ProfileManagerProps) {
  const { profiles, deleteProfile, renameProfile, currentProfileId } = useProfile();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Only use profiles from context
  const displayProfiles = profiles;

  const handleStartEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setNewName(currentName);
  };

  const handleSaveEdit = useCallback(async (id: string) => {
    if (newName.trim()) {
      setLoading(true);
      try {
        await renameProfile(id, newName);
      } finally {
        setLoading(false);
      }
    }
    setEditingId(null);
    setNewName('');
  }, [newName, renameProfile]);

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewName('');
  };

  const handleDeleteClick = (id: string) => {
    setProfileToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = useCallback(async () => {
    if (profileToDelete) {
      setLoading(true);
      try {
        await deleteProfile(profileToDelete);
      } finally {
        setLoading(false);
      }
      setDeleteDialogOpen(false);
      setProfileToDelete(null);
    }
  }, [profileToDelete, deleteProfile]);

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayProfiles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center">
                No profiles saved
              </TableCell>
            </TableRow>
          ) : (
            displayProfiles.map((profile) => (
              <TableRow key={profile.id} className={profile.id === currentProfileId ? "bg-muted/50" : ""}>
                <TableCell>
                  {editingId === profile.id ? (
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(profile.id);
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      disabled={loading}
                    />
                  ) : (
                    profile.name
                  )}
                </TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(profile.updatedAt), { addSuffix: true })}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {editingId === profile.id ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSaveEdit(profile.id)}
                          disabled={loading}
                        >
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelEdit}
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleStartEdit(profile.id, profile.name)}
                          disabled={loading}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(profile.id)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex justify-end">
        <Button onClick={onClose} disabled={loading}>Close</Button>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this profile. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={loading}>
              {loading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {loading && (
        <span className="ml-2 text-xs text-muted-foreground">Loading...</span>
      )}
    </div>
  );
});
