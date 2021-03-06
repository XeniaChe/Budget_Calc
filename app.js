

var budgetController = ( function () {
    

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Exp =  function (id, description, value)  {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentages = -1;
    };

    Exp.prototype.calcPercentages = function (totalInc) {
        if (totalInc >0) {
            this.percentages = Math.round ((this.value/totalInc)*100);
        } else {
            this.percentages= -1;
        }
        
    };
    Exp.prototype.getPercentages = function () {
        return this.percentages;
    }


    var data = {  // creating object for storinmg Incomes and Exp
        allItems: {
            inc: [],
            exp:[],
        },
        totals: {
            inc: 0,
            exp: 0,
        },
        budget: 0,
        percentage: -1
    }

 
    var calcTotals = function (type) {       //1 Total incomes/ expenses
        var sum  = 0;
        if (data.allItems[type].length > 0) {
            data.allItems[type].forEach( function(current) {          // Loop over tha erray
                sum += current.value; 
        
                data.totals[type]=sum; 
                })
        } else {data.totals[type]=0}
        

    }
    return {
        addItem: function (type, des, val) {
            var newItem, id;
           
            // Create new id
            //[1 2 3 4 5], next ID = 6
            //[1 2 4 6 8], next ID = 9
            // id = last id +1
            if ( data.allItems[type].length > 0) {
                id = data.allItems[type][data.allItems[type].length - 1].id + 1;  // the id for the each second el-t(newItem)

            } else {
                id=0;
            }
           
            // Creat new item based on 'inc' or 'exp' type
            if (type=== 'inc') {
                newItem = new Income (id, des ,val)
            } else if (type === 'exp') {
                newItem = new Exp (id, des, val)
            }


            //push it into data structure 
            data.allItems[type].push(newItem);
            // Return this el-t
            return newItem;
            },



            //4.Calculate the budget
        calcBudget: function () {       // for the updateBudget function in Controller

            //1 Total incomes/ expenses
            calcTotals('exp');
            calcTotals('inc');

            //2.  CAlc budget: incomes-expenses
            data.budget = data.totals.inc - data.totals.exp;

            //3. Calc percentage of used incomes
            if (data.totals.inc >0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc)*100)

            } else {
                data.percentage = -1;
            }
            
        },

        getBudget: function () {     // To return new budget in updateBudget function in Controller
            return {
                budget: data.budget,
                totalIncomes: data.totals.inc,
                totalExpenses: data.totals.exp,
                percentage: data.percentage
            }
        },
        
        deleteItem: function (type, id) {  // you will pass real type and id next in Controller 
            var ids, index;
            // id = 6
            //data.allItems[type][id]; this wont work properly. Cos if you del an el-t the Id wont change togather with index of the el-t in array
            // ids = [1 2 4 6 8]
            //index = 3
            ids = data.allItems[type].map(function (current) {      // in result an array with Ids
                return current.id;
            })

            index = ids.indexOf(id);     // Get the index of the id in the array
            
            if ( index !== -1) {
                data.allItems[type].splice(index, 1);   // SPLICE METHOD  for deleting
                
            }

          
        },


        calcPercentages: function () {
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentages(data.totals.inc);
            })
        },

        getPercentages: function () {
            var allPercentages = data.allItems.exp.map(function (cur) {
                return cur.getPercentages();
            })
            return allPercentages;             //result - an array 
        },
        

        testing: function () {
            console.log(data);     
          }
       
    }

    

}) ();

//______________________________________________________________________________________________________________________________________________________________

var UIController = (function () {
 

     
    // objsct for storing eventListener classes

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container ',
        expPercLabel: '.item__percentage', 
        dateLabel: '.budget__title--month',
        buttonLabel:'.ion-ios-checkmark-outline'
       
    }; 

    var formatNumber = function (num, type) {
        var num, numSplit, int, dec
        

        // exactly 2 decimal points
        num = Math.abs(num);       // abs - delete a sing "+ or -"
        num = num.toFixed(2);     // 2 decimal numbers after the number

        // a coma after thounsands 
        numSplit = num.split('.');    // result -an array ['', ''] 230,475-> ['230', '475']
        int = numSplit[0];            // result a stringh wich is a number 230 475-> 23 so int.lenght = 3
        if (int.length > 3 )  {
            int = int.substr(0, int.length - 3)+ ',' + int.substr(int.length-3, 3);
        }
        // + or - before number
        dec = numSplit[1];     // decimal part, goes after ','

        return  (type === 'exp' ? '-' : '+') + ' '+ int +'.' + dec; 
      };


   //  PUBLIC functions and variables
  return { 
      getInput: function () {
          return {                          // one object will be returned insteed of returning 3 variables (type, escription , value) separatelly . Next will becalled in Controller
             type: document.querySelector(DOMstrings.inputType).value,   // get the value of .add__type . Will be either  INC  or EXP
             description: document.querySelector(DOMstrings.inputDescription).value, 
             value: parseFloat(document.querySelector(DOMstrings.inputValue).value) 
          }
 
      },


      addListItem: function (obj, type) {  // Displaying received data in UI
 
         //1  Create HTML 'string' with placeholder text;
         var html, element; 

         if (type==='inc') {
            element = DOMstrings.incomeContainer;
            html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

         } else if (type === 'exp') {
            element = DOMstrings.expensesContainer;
            html =  ' <div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div></div></div>' ;       

         }

         //2  Replace the placeholder text with actual data from the obj = newItem fotm Controller;
          var newHtml;
          newHtml = html.replace('%id%', obj.id);                         //CHANGE HTML CONTENT
          newHtml = newHtml.replace('%description%', obj.description);
          newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

          //3  Insert HTML into DOM
         document.querySelector(element).insertAdjacentHTML('beforeend',  newHtml );

         },


        deleteListItem : function (selectorID) {
         document.getElementById(selectorID).parentNode.removeChild(document.getElementById(selectorID));
         },

      clearFields: function () {
          var fields, fieldsArr;
         fields =  document.querySelectorAll( DOMstrings.inputDescription + ',' + DOMstrings.inputValue );        // selecting fields that should be cleared
        //  fieldsArr = Array.prototype.slice.call(fields);                                     // converting list into array 

         fields.forEach( function (current) {
             current.value = "";
         });
         fields[0].focus();
         },


        displayBudget: function (obj) {
            var type;
            obj.budget >0 ? type=== 'inc' : type==='exp';
           document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber (obj.budget, type);
           document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber (obj.totalIncomes, 'inc');
           document.querySelector(DOMstrings.expensesLabel).textContent =formatNumber (obj.totalExpenses, 'exp');

           if (obj.percentage > 0 ) {
            document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
           } else { 
            document.querySelector(DOMstrings.percentageLabel).textContent = '---'
           }
           
        
         },

     displayPerc: function (percentages) {
            var fields = document.querySelectorAll(DOMstrings.expPercLabel) ;
            
            //second method
            fields.forEach (function (current,index) {
                if (percentages[index]>0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            })


            /*
            var nodeListforEach = function (nodeList, callBack) {
                for (let i = 0; i < nodeList.length; i++) {
                   callBack(nodeList[i], i);
                }
            }

            nodeListforEach(fields, function (current, index) {
                if (percentages[index]>0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
                
            });*/
          },

    displayDate: function () {
        var now, year, month, day,months;

         now = new Date(); 
         months = [ 'January', 'February', 'March', 'April' , 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
         year = now.getFullYear(); 
         month = now.getMonth();
         day = now.getUTCDay(); 
         document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' '+ year ;
 
        
    },
    changeType: function () {
        var fields = document.querySelectorAll( 
            DOMstrings.inputType + ',' +
            DOMstrings.inputDescription+ ',' +
            DOMstrings.inputValue
        );

        fields.forEach(function (current) {
           current.classList.toggle('red-focus');
        });

        document.querySelector(DOMstrings.buttonLabel).classList.toggle('red');
    },

      getDOMstrings: function () {
          return DOMstrings;                  /// to expose DOMstrings to the outside of UIController == to the PUBLIC
      }
  }   


}) ();


//______________________________________________________________________________________________________________________________________________________________



var controller = (function (budgetCtrl, UICtrl) {
   
    var EventListeners = function () {

        var DOM = UICtrl.getDOMstrings();                 // using DOMstrings from UIController  '.add__btn'

        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem); // here don't need to call ctrlAddItem fun (no () ), eventListener will call it when needed
        document.addEventListener('keypress', function (event) {
            if (event.keyCode ===13 || event.which ===13 ) {
                ctrlAddItem();   // calling this function if IF statement is true
            }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType ).addEventListener('change', UICtrl.changeType)
     
    }


    var updateBudget = function () {
        //4.Calculate the budget 
        budgetCtrl.calcBudget();

        // Return new budget
        var budget = budgetCtrl.getBudget();

        //5. Add the budget to the UI  (tyhis will be a method in UICtrl)
        UICtrl.displayBudget(budget);
       
    };
    
   var updatePercentages = function () {

    //1. calc percentage
        budgetCtrl.calcPercentages();

    //2. read the percentage from the Budget controller
        var percentages = budgetCtrl.getPercentages();

    //3. Update the UI with new percentage
        UICtrl.displayPerc(percentages);


        // console.log(percentages);
        };



    // custom function for press add__btn and keyPress event 
    var ctrlAddItem = function () {

        var input, newItem;

      //1. Get the input data
        input = UICtrl.getInput();    // calling the input object fronm UICtrl (all 3 variables at the same time)

        if (input.description !==''&& !isNaN(input.value) && input.value>0 ) {

        //2. Add the item to the budget controller 
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);  // passing data from UI getInput as arguments into budgetController.addItem


        //3. Add the item to the user interface 
        UICtrl.addListItem(newItem, input.type);   // exploring new data in UI using addListItem fun in UIController
       
       // 4. Using the clearFields 
        UICtrl.clearFields();


        //5. Calculate and update budget
        updateBudget();

        // 6. Calc and update the percentages
         updatePercentages();
        }
        
        // console.log('it works'); 
    }

    var ctrlDeleteItem = function (event) {    // git checkout Deleting item event CallBack function
        var itemId, splitID, type, ID;

        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;   // to get the ID of the el-t that was clicked on
        
        if (itemId) {
            //id = inc-1
            splitID = itemId.split('-');
            type = splitID[0];              // to store separatelly the type which is el-t nember 0 in array,that we get after split method
            ID = parseInt(splitID[1]) ;    // use parseInt cos after split splitID its an Array and not a number

            //1. Delete the data from data structure
            budgetCtrl.deleteItem(type, ID);

            //2. Delete the data from UI
            UICtrl.deleteListItem (itemId);

            //3. Update and show new budget 
            updateBudget();

            // 4. Calc and update the percentages
            updatePercentages();
         
        }
    }

     return {
         init: function () {
             console.log(' an App has started')
             UICtrl.displayBudget({
                budget: 0,
                totalIncomes: 0,
                totalExpenses: 0,
                percentage: -1  
             })
             EventListeners();   // CAlling the EVENTLISTENERS function and storing it inside INIT
             UICtrl.displayDate();
         }
     }


  

})(budgetController ,UIController); 


controller.init();   // CALLING THE INIT FUNCTION













