import { useState } from 'react';
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

interface ProfileManagerProps {
  onClose: () => void;
}

export function ProfileManager({ onClose }: ProfileManagerProps) {
  const { profiles, deleteProfile, renameProfile, currentProfileId } = useProfile();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<string | null>(null);

  // Only use profiles from context
  const displayProfiles = profiles;

  const handleStartEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setNewName(currentName);
  };

  const handleSaveEdit = async (id: string) => {
    if (newName.trim()) {
      await renameProfile(id, newName);
    }
    setEditingId(null);
    setNewName('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewName('');
  };

  const handleDeleteClick = (id: string) => {
    setProfileToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (profileToDelete) {
      await deleteProfile(profileToDelete);
      setDeleteDialogOpen(false);
      setProfileToDelete(null);
    }
  };

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
                        >
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelEdit}
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
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(profile.id)}
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
        <Button onClick={onClose}>Close</Button>
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
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
