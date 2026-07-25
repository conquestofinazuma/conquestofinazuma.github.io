/* Main Menu screen definition. */
Engine.register('mainmenu', {
  layout: 'mainmenu',
  onEnter(ctx){
    ctx.setButtons([
      { slot: 2, label: 'New Game', action: () => ctx.show('intro') },
      { slot: 4, label: 'Load Game', action: () => {
          console.log('[Conquest of Inazuma] Load Game triggered');
          // TODO: open load-game panel / file picker
        }
      }
    ]);
  }
});