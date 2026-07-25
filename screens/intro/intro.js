/* Intro screen: a short sequence of "pages" of text.
   Each page defines its own paragraphs and its own buttons.
   Pressing a button (usually "Next") replaces the page entirely —
   no scrollback, no history, just like flipping a page. */

Engine.register('intro', (() => {

  const pages = [
    {
      text: [
        "This is a placeholder first page — replace with real Conquest of Inazuma opening text once we draft it."
      ]
    },
    {
      text: [
        "This is a placeholder second page — replace with real Conquest of Inazuma opening text once we draft it.",
        "Mutton washes ashore on a remote Inazuman island, half-drowned, with no memory of how he crossed into this world..."
      ]
    }
  ];

  let currentPage = 0;

  function renderPage(ctx){
    const page = pages[currentPage];
    ctx.setText(page.text);

    const isLastPage = currentPage === pages.length - 1;

    ctx.setButtons([
      {
        slot: 1,
        label: isLastPage ? 'Continue' : 'Next',
        action: () => {
          if(isLastPage){
            currentPage = 0; // reset for next playthrough
            ctx.show('explore', { mapId: 'watatsumi', roomId: 'watatsumi_dock' });
          } else {
            currentPage++;
            renderPage(ctx);
          }
        }
      }
    ]);
  }

  return {
    layout: 'generic',
	showFrame: false,
    onEnter(ctx){
      currentPage = 0;
      renderPage(ctx);
    }
  };
})());