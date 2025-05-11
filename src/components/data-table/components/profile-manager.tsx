import React, { useState } from 'react';
import { useProfile } from '../contexts/profile-context'; // MODIFIED IMPORT PATH
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Edit3, Save, XCircle } from 'lucide-react';

interface ProfileManagerProps {
  onClose: () => void;
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({ onClose }) => {
  const { profiles, renameProfile, deleteProfile } = useProfile();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');

  const handleStartEdit = (profileId: string, currentName: string) => {
    setEditingId(profileId);
    setEditingName(currentName);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleSaveEdit = async (profileId: string) => {
    if (editingName.trim()) {
      await renameProfile(profileId, editingName.trim());
      handleCancelEdit();
    }
  };

  const handleDelete = async (profileId: string) => {
    // Optional: Add a confirmation dialog here
    // if (window.confirm('Are you sure you want to delete this profile?')) {
    await deleteProfile(profileId);
    // }
  };

  if (profiles.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">No profiles saved yet.</p>
        <Button onClick={onClose} className="mt-4">Close</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-1">
      <ul className="space-y-2 max-h-72 overflow-y-auto">
        {profiles.map(profile => (
          <li key={profile.id} className="flex items-center justify-between p-2 border rounded-md">
            {editingId === profile.id ? (
              <Input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                className="flex-grow mr-2 h-8"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(profile.id)}
              />
            ) : (
              <span className="flex-grow truncate" title={profile.name}>{profile.name}</span>
            )}
            <div className="flex items-center gap-1 ml-2 flex-shrink-0">
              {editingId === profile.id ? (
                <>
                  <Button variant="ghost" size="icon" onClick={() => handleSaveEdit(profile.id)} title="Save changes">
                    <Save className="h-4 w-4 text-green-600" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleCancelEdit} title="Cancel edit">
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </>
              ) : (
                <Button variant="ghost" size="icon" onClick={() => handleStartEdit(profile.id, profile.name)} title="Rename profile">
                  <Edit3 className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={() => handleDelete(profile.id)} title="Delete profile">
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex justify-end pt-2">
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}; 