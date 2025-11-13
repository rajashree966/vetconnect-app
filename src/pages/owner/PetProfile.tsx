import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, PawPrint, Trash2 } from "lucide-react";

interface Pet {
  id: string;
  name: string;
  type: string;
  breed: string;
  age: number;
  weight: number;
}

const PetProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pets, setPets] = useState<Pet[]>([]);
  const [newPet, setNewPet] = useState({
    name: "",
    type: "dog",
    breed: "",
    age: 0,
    weight: 0,
  });

  const handleAddPet = () => {
    if (!newPet.name || !newPet.breed) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const pet: Pet = {
      id: Date.now().toString(),
      ...newPet,
    };

    setPets([...pets, pet]);
    setNewPet({ name: "", type: "dog", breed: "", age: 0, weight: 0 });
    
    toast({
      title: "Success",
      description: "Pet profile added successfully",
    });
  };

  const handleDeletePet = (id: string) => {
    setPets(pets.filter(pet => pet.id !== id));
    toast({
      title: "Deleted",
      description: "Pet profile removed",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-hero p-6">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/owner/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Add New Pet */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <PawPrint className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Add New Pet</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pet_name">Pet Name *</Label>
                <Input
                  id="pet_name"
                  value={newPet.name}
                  onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
                  placeholder="e.g., Max"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pet_type">Type *</Label>
                <Select
                  value={newPet.type}
                  onValueChange={(value) => setNewPet({ ...newPet, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dog">Dog</SelectItem>
                    <SelectItem value="cat">Cat</SelectItem>
                    <SelectItem value="bird">Bird</SelectItem>
                    <SelectItem value="rabbit">Rabbit</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="breed">Breed *</Label>
                <Input
                  id="breed"
                  value={newPet.breed}
                  onChange={(e) => setNewPet({ ...newPet, breed: e.target.value })}
                  placeholder="e.g., Labrador"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age (years)</Label>
                  <Input
                    id="age"
                    type="number"
                    value={newPet.age}
                    onChange={(e) => setNewPet({ ...newPet, age: parseInt(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={newPet.weight}
                    onChange={(e) => setNewPet({ ...newPet, weight: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <Button onClick={handleAddPet} className="w-full">
                Add Pet
              </Button>
            </div>
          </Card>

          {/* Pet List */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">My Pets</h2>
            {pets.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No pets added yet</p>
              </Card>
            ) : (
              pets.map((pet) => (
                <Card key={pet.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2">{pet.name}</h3>
                      <div className="space-y-1 text-muted-foreground">
                        <p><span className="font-semibold">Type:</span> {pet.type}</p>
                        <p><span className="font-semibold">Breed:</span> {pet.breed}</p>
                        <p><span className="font-semibold">Age:</span> {pet.age} years</p>
                        <p><span className="font-semibold">Weight:</span> {pet.weight} kg</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeletePet(pet.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetProfile;
