/* Main Menu screen definition. */
Engine.register('mainmenu', {
  layout: 'mainmenu',
  showFrame: false,
  onEnter(ctx){
    ctx.setButtons([
      { slot: 2, label: 'New Game', action: () => ctx.show('intro') },
      { slot: 4, label: 'Load Game', action: () => {
          console.log('[Conquest of Inazuma] Load Game triggered');
        }
      },
      { slot: 8, label: '(test row B)', action: () => {
          console.log('[Conquest of Inazuma] Test button pressed');
        }
      }
    ]);
  }
});