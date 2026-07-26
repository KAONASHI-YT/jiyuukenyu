/**
 * ==========================================================================
 * インターネットの危険性について - 自由研究 Webサイト用 JavaScript
 * 機能:
 *  1. スクロール時の要素フェードイン（Intersection Observer）
 *  2. 実験画像のモーダル拡大・縮小表示
 *  3. 「安全利用」チェックリストのインタラクション & 進捗管理
 *  4. A4印刷ダイアログの起動処理
 * ==========================================================================
 */

// ==========================================================================
// 簡易アクセス制限（合言葉判定）設定
// ※シークレットワード（合言葉）を好きな言葉に変更する場合は、以下の文字列を書き換えてください。
// ==========================================================================
const SECRET_WORD = "jiyuukenkyu"; // デフォルトの合言葉

// デバッグ用：JSエラーが発生した際にロック画面にエラーを表示する
window.onerror = function(message, source, lineno, colno, error) {
  const errDiv = document.getElementById('lockError');
  if (errDiv) {
    errDiv.textContent = 'エラー発生: ' + message + ' (' + lineno + '行目)';
    errDiv.style.color = '#ff4d6d';
  }
  return false;
};

document.addEventListener('DOMContentLoaded', () => {

  const lockScreen = document.getElementById('lockScreen');
  const mainContent = document.getElementById('mainContent');
  const secretInput = document.getElementById('secretInput');
  const unlockBtn = document.getElementById('unlockBtn');
  const lockError = document.getElementById('lockError');

  // ロック解除処理
  const unlockContent = () => {
    if (lockScreen && mainContent) {
      lockScreen.classList.add('fade-out');
      mainContent.style.display = 'block';
      document.body.classList.add('is-unlocked');
      sessionStorage.setItem('isUnlocked', 'true');
    }
  };

  // すでにセッション中にロック解除済みか確認
  if (sessionStorage.getItem('isUnlocked') === 'true') {
    unlockContent();
  }

  // 全角英数を半角英数に変換する関数（入力の揺らぎ防止）
  const toHalfWidth = (str) => {
    return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => {
      return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
  };

  // 解除ボタンクリックイベント
  if (unlockBtn) {
    unlockBtn.addEventListener('click', () => {
      // 入力値の前後のスペースを削除し、全角を半角に変換、小文字に統一して比較
      const processedInput = toHalfWidth(secretInput.value).trim().toLowerCase();
      const processedSecret = SECRET_WORD.trim().toLowerCase();

      if (processedInput === processedSecret) {
        unlockContent();
      } else {
        if (lockError) {
          lockError.textContent = '合言葉が正しくありません。';
        }
        secretInput.style.borderColor = 'var(--crimson-accent)';
        secretInput.focus();
      }
    });
  }

  // Enterキーでの解除
  if (secretInput) {
    secretInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        unlockBtn.click();
      }
    });
  }


  /* ------------------------------------------------------------------------
   * 1. スクロールアニメーション (Intersection Observer)
   * ------------------------------------------------------------------------ */
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -50px 0px',
    threshold: 0.1
  };

  const scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // 一度表示されたら監視を解除（スクロールを戻しても消えないようにする）
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // 対象要素を監視登録
  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    scrollObserver.observe(el);
  });


  /* ------------------------------------------------------------------------
   * 2. 画像拡大モーダルダイアログ
   * ------------------------------------------------------------------------ */
  const modalOverlay = document.getElementById('imageModal');
  const modalImage = document.getElementById('modalImage');
  const modalCloseBtn = document.getElementById('modalCloseBtn');

  // 実験カードの画像クリックイベント
  document.querySelectorAll('.exp-image-box').forEach(box => {
    box.addEventListener('click', () => {
      const img = box.querySelector('img');
      if (img && modalOverlay && modalImage) {
        modalImage.src = img.src;
        modalImage.alt = img.alt || '拡大画像';
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // 背景スクロール固定
      }
    });
  });

  // モーダル閉じる関数
  const closeModal = () => {
    if (modalOverlay) {
      modalOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  if (modalOverlay) {
    // 背景エリアクリックで閉じる
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });
  }

  // キーボードの Esc キーで閉じる
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });


  /* ------------------------------------------------------------------------
   * 3. 安全対策チェックリスト & 進捗バー
   * ------------------------------------------------------------------------ */
  const checklistItems = document.querySelectorAll('.checklist-item');
  const progressBarFill = document.getElementById('checklistProgressBar');
  const checklistCounter = document.getElementById('checklistCounter');

  const updateChecklistProgress = () => {
    const total = checklistItems.length;
    let checkedCount = 0;

    checklistItems.forEach(item => {
      if (item.classList.contains('checked')) {
        checkedCount++;
      }
    });

    const percentage = total > 0 ? (checkedCount / total) * 100 : 0;
    if (progressBarFill) {
      progressBarFill.style.width = `${percentage}%`;
    }
    if (checklistCounter) {
      checklistCounter.textContent = `${checkedCount} / ${total} 達成`;
    }
  };

  checklistItems.forEach(item => {
    item.addEventListener('click', () => {
      item.classList.toggle('checked');
      updateChecklistProgress();
    });
  });

  // 初期化実行
  updateChecklistProgress();


  /* ------------------------------------------------------------------------
   * 4. 印刷実行処理
   * ------------------------------------------------------------------------ */
  const printBtn = document.getElementById('printBtn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }
});
