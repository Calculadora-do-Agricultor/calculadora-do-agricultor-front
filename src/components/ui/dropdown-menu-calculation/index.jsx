import React, { useContext, useState } from "react";
import {
  Edit,
  Trash2,
  MoreVertical,
  History,
  Star,
  StarOff,
} from "lucide-react";
import { AuthContext } from "../../../context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { Button } from "../button";
import CalculationHistoryModal from "../../CalculationHistoryModal";

const CalculationDropdownMenu = ({ calculation, onEdit, onDelete, onToggleFavorite }) => {
  const { user, isAdmin } = useContext(AuthContext);
  const [isFavorite, setIsFavorite] = useState(false); // TODO: Implementar lógica de favoritos
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  
  // Verifica se o usuário atual é o criador do cálculo ou um administrador
  const canEdit = isAdmin || (user && calculation.createdBy === user.uid);

  const handleEdit = () => {
    window.location.href = `/edit-calculation/${calculation.id}`;
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(calculation);
    }
  };

  const handleHistory = () => {
    setIsHistoryModalOpen(true);
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    if (onToggleFavorite) {
      onToggleFavorite(calculation, !isFavorite);
    }
  };

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          aria-label="Opções do cálculo"
        >
          <MoreVertical className="h-4 w-4 text-gray-600" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-48 bg-white border border-gray-200 shadow-lg rounded-md"
      >
        {/* Header principal */}
        <DropdownMenuLabel className="px-3 py-2 text-sm font-semibold text-gray-900 border-b border-gray-100">
          Opções
        </DropdownMenuLabel>
        
        {/* Opções disponíveis para todos os usuários */}
        <DropdownMenuItem 
          onClick={handleHistory}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
        >
          <History className="h-4 w-4 text-blue-600" />
          <span>Histórico</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={handleToggleFavorite}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
        >
          {isFavorite ? (
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
          ) : (
            <StarOff className="h-4 w-4 text-gray-500" />
          )}
          <span>{isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}</span>
        </DropdownMenuItem>
        
        {/* Seção administrativa apenas se houver opções de admin */}
        {canEdit && (
          <>
            <DropdownMenuSeparator className="my-1 bg-gray-200" />
            
            <DropdownMenuLabel className="px-3 py-2 text-sm font-semibold text-gray-900">
              Administração
            </DropdownMenuLabel>
            
            <DropdownMenuItem 
              onClick={handleEdit}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              <Edit className="h-4 w-4 text-green-600" />
              <span>Editar</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={handleDelete}
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
            >
              <Trash2 className="h-4 w-4 text-red-600" />
              <span>Excluir</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
    
    {/* Modal de Histórico */}
    <CalculationHistoryModal
      isOpen={isHistoryModalOpen}
      onClose={() => setIsHistoryModalOpen(false)}
      onOpen={() => setIsHistoryModalOpen(true)}
      calculation={calculation}
      calculationHistoryId={calculation?.historyId || calculation?.id}
    />
  </>
  );
};

export default CalculationDropdownMenu;