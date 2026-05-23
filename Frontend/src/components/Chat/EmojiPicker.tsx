import React from "react";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onClose?: () => void;
}

const emojis = ["😀","😂","😍","😎","😭","😡","👍","🙏","🎉","🔥","❤️","😅","😇","😜","😱","😏"];

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect, onClose }) => (
  <div className="bg-white border rounded shadow p-2 flex flex-wrap w-64">
    <div className="flex flex-wrap gap-2">
      {emojis.map((emoji) => (
        <button
          key={emoji}
          className="text-2xl hover:bg-gray-100 rounded p-1"
          onClick={() => onEmojiSelect(emoji)}
        >
          {emoji}
        </button>
      ))}
    </div>
    {onClose && (
      <button className="mt-2 text-xs text-gray-500 underline" onClick={onClose}>Close</button>
    )}
  </div>
);

export default EmojiPicker;
