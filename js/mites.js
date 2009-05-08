var imageCount = 0
var TotalImageCount = 2

var miteCount = 20
var chipCount = 50

var MaxX = 600
var MaxY = 600

var maxTurnDelta = 500
var huntWaitTime = 500
var moveSpeed = 5

var miteArray = new Array (50)
var chipArray = new Array (200)

var timeout = null

function toggleSimRunState () {

   var button = document.getElementById ("pauseButton")

   if (timeout) {

      clearTimeout (timeout)
      timeout = null

      if (button) { button.innerHTML = "Start" }
   }
   else {

      if (button) { button.innerHTML = "Pause" }
      tickSim ()
   }
}

function updateMiteCount (count) {

   var diff = count - miteCount

   if (diff > 0) {

      for (ix = miteCount; ix < count; ix++) {

         miteArray[ix] = createMite (ix)
      }
   }
   else if (diff < 0) {

      for (ix = miteCount - 1; ix >= count; ix--) {

         var chip = miteArray[ix].chip

         if (chip >= 0) {

            chipArray[chip].mite = -1
            chipArray[chip].x = miteArray[ix].x
            chipArray[chip].y = miteArray[ix].y
         }

         miteArray[ix] = null
      }
   }

   miteCount = count

   var span = document.getElementById ("miteCount")
   if (span) { span.innerHTML = "" + count }

   if (timeout === null) { tickSim (true) }
}

function updateChipCount (count) {

   var diff = count - chipCount

   if (diff > 0) {

      for (ix = chipCount; ix < count; ix++) {

         chipArray[ix] = createChip ()
      }
   }
   else if (diff < 0) {

      for (ix = chipCount - 1; ix >= count; ix--) {

         var mite = chipArray[ix].mite

         if (mite >= 0) {

            miteArray[mite].chip = -1
         }

         chipArray[ix] = null
      }
   }

   chipCount = count

   var span = document.getElementById ("chipCount")
   if (span) { span.innerHTML = "" + count }

   if (timeout === null) { tickSim (true) }
}

function log (value) { window.console.log (value) }

function findChip (x, y, radius) {

   var r2 = radius * radius
   var chip = -1
   var which = 0

   while ((chip < 0) && (which < chipCount)) {

      if (chipArray[which].mite < 0) {

         var dx = x - chipArray[which].x
         dx = dx * dx
         var dy = y - chipArray[which].y
         dy = dy * dy
         if (r2 > (dx + dy)) { chip = which }
      }

      which++
   }

   return chip
}

function move (frameTime) {

   if (!this.nextTurn || (this.nextTurn < frameTime)) {

      this.nextTurn = frameTime + (maxTurnDelta * Math.random ())
      this.h = Math.PI * 2 * Math.random ()
      this.xdir = Math.sin (this.h)
      this.ydir = -Math.cos (this.h)
   }

   this.x += this.xdir * moveSpeed 
   this.y += this.ydir * moveSpeed
   if (this.x < 0) { this.x = MaxX }
   else if (this.x > MaxX) { this.x = 0 }
   if (this.y < 0) { this.y = MaxY }
   else if (this.y > MaxY) { this.y = 0 }

   if (this.nextHunt < frameTime) {

      var chip = findChip (this.x + (this.xdir * (15)), this.y + (this.ydir * (15)), 5)

      if (chip >= 0) {

         if (this.chip < 0) {

            this.chip = chip
            chipArray[chip].mite = this.which
         }
         else {

            chipArray[this.chip].x = this.x + (this.xdir * 14)
            chipArray[this.chip].y = this.y + (this.ydir * 14)
            chipArray[this.chip].mite = -1
            this.chip = -1
         }

         this.nextHunt = frameTime + huntWaitTime
      }
   }
}

function createMite (which) {

   var mite = new Object ();
   mite.x = MaxX * Math.random ()
   mite.y = MaxY * Math.random ()
   mite.h = 0
   mite.chip = -1
   mite.nextHunt = 0
   mite.which = which
   mite.move = move

   return mite
}

function createChip () {

   var chip = new Object ();
   chip.x = MaxX * Math.random ()
   chip.y = MaxY * Math.random ()
   chip.mite = -1

   return chip
}

function imageLoad () {

   imageCount++

   if (imageCount == TotalImageCount) {

      initSim ()
      tickSim ()
   }
}

function initSim () {

   for (ix = 0; ix < miteCount; ix++) {

      miteArray[ix] = createMite (ix)
   }

   for (ix = 0; ix < chipCount; ix++) {

      chipArray[ix] = createChip ()
      chipArray[ix].which = ix
   }

   if (timeout === null) { tickSim (true) }
}

var mite = new Image ()
mite.src = "assets/mite.png"
mite.onload = imageLoad
var chip = new Image ()
chip.src = "assets/chip.png"
chip.onload = imageLoad

var frameTime = -1

function tickSim (oneFrame) {

   var canvas = document.getElementById ("mites")

   var nextFrame = 33

   if (canvas) {

      var date = new Date ()

      if (frameTime < 0) { frameTime = date.getTime () }
      else {

         var ctime = date.getTime ()
         nextFrame -= ctime - frameTime
         frameTime = ctime
         if (nextFrame < 0) { nextFrame = 0 }
      }

      var context = canvas.getContext ("2d")

      /*
      context.fillStyle = "black"
      context.fillRect (0, 0 ,MaxX, MaxY)
      context.fillStyle = "white"
      context.fillRect (5, 5, MaxX - 10, MaxY - 10)
      */
      context.clearRect (0, 0 ,MaxX, MaxY)

      for (ix = 0; ix < chipCount; ix++) {

         if (chipArray[ix].mite < 0) {

            context.save ()
            context.translate (chipArray[ix].x, chipArray[ix].y)
            context.drawImage (chip, -5, -5)
            context.restore ()
         }
      }

      for (ix = 0; ix < miteCount; ix++) {

         var drawChip = miteArray[ix].chip >= 0
         if (oneFrame === true) { } // do nothing
         else { miteArray[ix].move (frameTime) }
         context.save ()
         context.translate (miteArray[ix].x, miteArray[ix].y)
         context.rotate (miteArray[ix].h)
         if (drawChip) { context.drawImage (chip, -5, -19) }
         context.drawImage (mite, -10, -10)
         context.restore ()
      }
   }

   if (oneFrame === true) { timeout = null }
   else { timeout = setTimeout (tickSim, nextFrame) }
}
