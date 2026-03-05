'use strict';
// ==================================================
// 発表会用ページでスクロールバーを消す
// ==================================================
if (new URLSearchParams(location.search).get('preview') === '1') {
  document.documentElement.classList.add('is-preview');
  document.body.classList.add('is-preview');
}


const params = new URLSearchParams(location.search);
const isPreview = params.get('preview') === '1';

if (isPreview) {
  document.documentElement.classList.add('is-preview');
  document.body.classList.add('is-preview');

  // 同一サイト内リンクに preview=1 を付ける
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a) return;

    const url = new URL(a.href, location.href);

    // 外部リンクや # だけは触らない
    if (url.origin !== location.origin) return;

    // 同じページ内アンカー(#about など)も維持しつつ付与
    url.searchParams.set('preview', '1');
    a.href = url.toString();
  });
}
