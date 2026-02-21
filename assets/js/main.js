'use strict';

//===== メインビュー切り替え =====
const slides = document.querySelectorAll('.hero__bg');
let current = 0;

setInterval(() => {
  const next = (current + 1) % slides.length;

  // 先に次を表示（重なる時間を作る）
  slides[next].classList.add('is-active');

  // 1.2秒後に表示されている画像からクラスを外して消す
  setTimeout(() => {
    slides[current].classList.remove('is-active');
    current = next;
  }, 1200); // ←CSSのtransition時間(1.2s)と合わせる
}, 5000);


//===== スライダー用の設定 =====

const swiperEl = document.querySelector('.swiper');

if (swiperEl && typeof Swiper !== 'undefined') {
  new Swiper('.mySlider', {
    loop: true,
    centeredSlides: true,
    slidesPerView: "auto",
    spaceBetween: 20,
    initialSlide: 1,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    breakpoints: {
      768: { slidesPerView: 1.6, spaceBetween: 32 },
      1024:{ slidesPerView: 1.9, spaceBetween: 40 },
    },
  });
}
// const swiper = new Swiper(".mySlider", {
//   loop: true,
//   centeredSlides: true,
//   slidesPerView: "auto",
//   spaceBetween: 20,
//   initialSlide: 1,
//   pagination: {
//     el: ".swiper-pagination",
//     clickable: true,
//   },
//   breakpoints: {
//     768: { slidesPerView: 1.6, spaceBetween: 32 },
//     1024:{ slidesPerView: 1.9, spaceBetween: 40 },
//   },
// });


//===== モーダル関連 =====
document.addEventListener('DOMContentLoaded', () => {
  const dialog = document.getElementById('photoModal');
  if (!dialog) return;
// もしdialogがなかったらこの処理を止める

  const modalImg = dialog.querySelector('.photoModal__img');
  const closeBtn = dialog.querySelector('.photoModal__close');

  let scrollY = 0;

  // ボディのスクロール位置をscrollY変数に取得し、固定する
  const lockScroll = () => {
    scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
  };

  // ボディのスクロールを開放する
  const unlockScroll = () => {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';

    // ★ここがポイント：復帰スクロールだけスムースを無効化
    const html = document.documentElement;
    const prev = html.style.scrollBehavior; // インライン指定を退避（空のことが多い）
    html.style.scrollBehavior = 'auto';

    window.scrollTo(0, scrollY);

    // すぐ戻す（次のフレームで戻すとより安全）
    requestAnimationFrame(() => {
      html.style.scrollBehavior = prev;
    });
  };


//HTML内の写真リストのaタグをすべて取得して、forEachで一つ一つに対して処理を行う（関数の埋め込み）
  document.querySelectorAll('.aboutPhotos__link').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault(); //HTMLの本来の動作を制限する。ここではaタグでのページ遷移をさせなくする
      e.stopPropagation(); //親要素へのイベントの伝播を防ぐaタグがクリックされたとき、dialogもクリックされた。とならないように
      e.stopImmediatePropagation(); //クリックされたほか要素への伝播を防ぐ

      const img = link.querySelector('img'); //写真リストのイメージタグの要素を取得
      modalImg.src = link.getAttribute('href'); //モーダルのソースに、写真リストのaタグのURLを格納
      modalImg.alt = img?.alt ?? ''; //モーダルのaltに写真リストのaltを格納する。もしなければ’’(空文字)を課k脳する

      lockScroll(); //上のスコープで定義したスクロールロックを入れる
      dialog.showModal(); //既存のメソッドでダイアログを表示ここまででダイアログの中には写真リストの写真がmodalImgに格納されている。

    }, true);
  });

  //モーダルを閉じる関数を宣言
  const closeModal = () => {
    dialog.close();
  };

  //クローズボタンあり、クリックされたとき宣言した関数を実行(A ? B =AがあるときBを実行する)
  closeBtn?.addEventListener('click', closeModal);

  //CancelはEcsボタンを押したときの挙動。ecsを押してもウィンドウがクローズするようにする
  dialog.addEventListener('cancel', (e) => {
    e.preventDefault();
    closeModal();
  });

  //ダイアログをクリックしたときの挙動、写真の外をクリックした場合closeModalが実行される
  dialog.addEventListener('click', (e) => {

    const rect = dialog.getBoundingClientRect(); //ダイアログの表示領域と場所を取得してrectへ格納

    //下記は定数＝条件式の形なので、true/falseのどちらかが格納される。
    //ちなみに下記はクリックした位置のX.Y座標がダイアログの左辺/上辺より小さい、X.Y座標が右辺/下辺大きい場合、画面外と判別し、どれかに当てはまった場合trueを返す。
    const clickedOutside =
      e.clientX < rect.left || e.clientX > rect.right ||
      e.clientY < rect.top  || e.clientY > rect.bottom;
    if (clickedOutside) closeModal(); //clickedOutsideがtrueだった時にcloseModalを実行する
  });

  //ダイアログがクローズしたとき、スクロールロック解除、modalImgの要素を削除、空白にして次以降のちらつきを抑える。
  dialog.addEventListener('close', () => {
    unlockScroll();
    modalImg.removeAttribute('src');
    modalImg.alt = '';
  });
});
//ここまでモーダル関連


//トップに戻るボタン
const btn = document.querySelector('.btn__toTop');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  console.log(scrollY);

  if (scrollY > 300) {
    btn.classList.add('is-show');
  } else {
    btn.classList.remove('is-show');
  }
});
