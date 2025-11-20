
import React from 'react';
import { Player, Position } from '../types';
import { User } from 'lucide-react';

interface PlayerRowProps {
  player: Player;
  actionButton?: React.ReactNode;
  showPrice?: boolean;
  onSell?: (p: Player) => void;
  onLoan?: (p: Player) => void;
  onRenew?: (p: Player) => void;
}

const getPositionColor = (pos: Position) => {
  switch (pos) {
    case Position.GK: return 'bg-yellow-100 text-yellow-800';
    case Position.DEF: return 'bg-blue-100 text-blue-800';
    case Position.MID: return 'bg-green-100 text-green-800';
    case Position.ATT: return 'bg-red-100 text-red-800';
  }
};

const getPositionAbbr = (pos: Position) => {
    switch (pos) {
      case Position.GK: return 'GOL';
      case Position.DEF: return 'DEF';
      case Position.MID: return 'MEI';
      case Position.ATT: return 'ATA';
      default: return pos;
    }
  };

export const PlayerRow: React.FC<PlayerRowProps> = ({ player, actionButton, showPrice = false, onSell, onLoan, onRenew }) => {
  return (
    <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-3 md:gap-4 overflow-hidden flex-1">
        <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-slate-200 text-slate-500 relative`}>
           <User size={18} className="md:hidden" />
           <User size={20} className="hidden md:block" />
           {player.isLoaned && (
               <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-[8px] font-bold px-1 rounded-full border border-white" title="Emprestado">
                   EMP
               </div>
           )}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-slate-800 text-sm md:text-base truncate pr-2">{player.name}</p>
          <div className="flex gap-2 text-xs mt-0.5 md:mt-1">
            <span className={`px-1.5 py-0.5 rounded md:rounded-full font-medium text-[10px] md:text-xs ${getPositionColor(player.position)}`}>
              <span className="md:hidden">{getPositionAbbr(player.position)}</span>
              <span className="hidden md:inline">{player.position}</span>
            </span>
            <span className="hidden xs:flex items-center text-slate-500 text-[10px] md:text-xs">
              {player.age} anos
            </span>
            {player.salary && (
                <span className="hidden md:flex items-center text-emerald-600 text-[10px] md:text-xs font-medium">
                   ${player.salary}k/sem
                </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-shrink-0">
        
        {/* Contract Info (Only in Squad view typically) */}
        {onRenew && (
            <div className="hidden sm:block text-center w-20">
                <p className="text-[9px] text-slate-500 uppercase font-bold">Contrato</p>
                <p className={`font-bold text-xs ${player.contractWeeks < 10 ? 'text-red-600' : player.isLoaned ? 'text-blue-600' : 'text-slate-700'}`}>
                    {player.contractWeeks} sem.
                </p>
            </div>
        )}

        <div className="text-center min-w-[30px]">
          <p className="text-[9px] md:text-xs text-slate-500 uppercase font-bold">OVR</p>
          <p className={`font-bold text-sm md:text-base ${player.rating >= 80 ? 'text-green-600' : player.rating >= 70 ? 'text-yellow-600' : 'text-slate-600'}`}>
            {player.rating}
          </p>
        </div>
        
        {showPrice && (
           <div className="text-right w-16 md:w-24">
             <p className="text-[9px] md:text-xs text-slate-500 uppercase font-bold">Valor</p>
             <p className="font-semibold text-emerald-700 text-xs md:text-base">
               $ {player.value.toFixed(1)}M
             </p>
           </div>
        )}

        {/* Action Buttons Group */}
        <div className="flex gap-1">
            {onSell && !player.isLoaned && (
                <button 
                    onClick={() => onSell(player)}
                    className="text-[10px] md:text-xs bg-red-50 text-red-600 hover:bg-red-100 px-2 py-1.5 rounded border border-red-200 transition-colors"
                    title="Vender Jogador"
                >
                    Vender
                </button>
            )}
            {onLoan && !player.isLoaned && (
                <button 
                    onClick={() => onLoan(player)}
                    className="text-[10px] md:text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1.5 rounded border border-blue-200 transition-colors"
                    title="Emprestar Jogador"
                >
                    Emprestar
                </button>
            )}
            {onRenew && !player.isLoaned && (
                <button 
                    onClick={() => onRenew(player)}
                    className="text-[10px] md:text-xs bg-green-50 text-green-600 hover:bg-green-100 px-2 py-1.5 rounded border border-green-200 transition-colors"
                    title="Renovar Contrato (+50 sem.)"
                >
                    Renovar
                </button>
            )}
             {/* Emprestado label if buttons are missing but it is loan */}
             {onRenew && player.isLoaned && (
                 <span className="text-[10px] md:text-xs bg-blue-100 text-blue-700 px-2 py-1.5 rounded border border-blue-200 font-bold">
                    Empréstimo
                 </span>
             )}
            {actionButton && actionButton}
        </div>
      </div>
    </div>
  );
};