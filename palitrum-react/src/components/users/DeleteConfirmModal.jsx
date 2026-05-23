import Modal from '../common/Modal';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;
  return (
    <Modal title="Удалить пользователя?" onClose={onClose}>
      <div>Вы уверены, что хотите удалить этого пользователя?</div>
      <div className="mt-3 flex gap-2">
        <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={onConfirm}>
          Удалить
        </button>
        <button className="px-4 py-2 rounded border" onClick={onClose}>
          Отмена
        </button>
      </div>
    </Modal>
  );
}