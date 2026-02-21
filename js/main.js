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
  if (scrollY > 300) {
    btn.classList.add('is-show');
  } else {
    btn.classList.remove('is-show');
  }
});


//スクロールでのセクションフェードアニメーション
document.addEventListener('DOMContentLoaded', () => {
  const targets = document.querySelectorAll('.js-reveal');
  if (!targets.length) return;

  // IntersectionObserver が無い古い環境向けフォールバック（最低限）
  if (!('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add('is-visible');
      // 一度だけで良いなら監視解除（パフォーマンス◎）
      observer.unobserve(entry.target);
    });
  }, {
    root: null,
    threshold: 0.1,
    // ちょい早めに発火させたいなら下を調整
    rootMargin: '0px 0px -10% 0px',
  });

  targets.forEach(el => io.observe(el));
});


//タイピングアニメーション
document.addEventListener("DOMContentLoaded", () => {
  // HTMLからタイトルの文字を取得
  const targets = document.querySelectorAll(".type-js");

  //取得したタイトル文字を配列に退避してから消す(el)
  targets.forEach((el) => {
    el.dataset.typeText = el.textContent.trim(); // 退避
    el.textContent = "";                         // 消す
  });

  //タイピングエフェクトの関数定義
  function typeEffect(el, speed = 80) {
    const text = el.dataset.typeText; // 退避した文字を使う
    if (!text) return;

    el.classList.add("is-typing");//入力前状態の明示のためクラス追加
    el.textContent = "";//ちらつき防止のためHTML側の文字を消す

    let index = 0;
    //タイピングアニメーションそのもの
    function typing() {
      if (index < text.length) {//indexを文字の単位として、文字がテキストの長さより短い間処理を続ける
        el.textContent += text.charAt(index);
        index++;
        setTimeout(typing, speed);//この処理を１文字づつ続ける。speedは次の文字が出るまでの時間(ms)
      } else {//ifが終了したら完了した、というクラスを付けて再発火を防止する
        el.classList.remove("is-typing");
        el.classList.add("is-typed");
      }
    }
    typing();//タイピングする実際の関数を実行
  }

  // ② 表示されたら発火
  const observer = new IntersectionObserver((entries) => { //ブラウザに判定を依頼
      entries.forEach((entry) => { //監視結果の配列であるentriesをentryに個別切り分け
        if (!entry.isIntersecting) return; //entryが交差していない場合は!false=trueとなり処理を飛ばす

        const el = entry.target; //処理が飛ばされなかった場合、entry.target=js-typeの要素をelへ代入
        if (el.classList.contains("is-typed")) return; // 再発火防止 elにis-typedがついていたら処理を飛ばす
        typeEffect(el, 80); //タイプエフェクト処理を現在のelに対して行う 一文字づつてる速度を書く
        observer.unobserve(el); //現在のelを監視対象から外す
      });
    },
    { threshold: 1 }
  );

  targets.forEach((el) => observer.observe(el));//forEachの結果を問わず、監視対象を指定する
  // console.log('targetsの中身',targets);
  // console.log('observerの中身',observer);
});//ここまでタイピングアニメーション
