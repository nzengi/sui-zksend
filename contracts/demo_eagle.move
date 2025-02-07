module demo_eagle::demo_eagle {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::package;
    use sui::display;
    use std::string::{Self, String};

    struct DemoEagle has key, store {
        id: UID,
        name: String
    }

    struct DEMO_EAGLE has drop {}

    fun init(witness: DEMO_EAGLE, ctx: &mut TxContext) {
        let publisher = package::claim(witness, ctx);
        
        let keys = vector[
            string::utf8(b"name"),
            string::utf8(b"image_url"),
            string::utf8(b"description")
        ];

        let values = vector[
            string::utf8(b"{name}"),
            string::utf8(b"https://images.unsplash.com/photo-1548250096-8f8e0c02f1cf?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZWFnbGV8ZW58MHx8MHx8fDA%3D"),
            string::utf8(b"The majestic guardian of the skies!")
        ];

        let display = display::new_with_fields<DemoEagle>(
            &publisher, 
            keys,
            values,
            ctx
        );

        display::update_version(&mut display);

        transfer::public_transfer(display, tx_context::sender(ctx));
        transfer::public_transfer(publisher, tx_context::sender(ctx));
    }

    public entry fun new(name: String, ctx: &mut TxContext) {
        let eagle = DemoEagle {
            id: object::new(ctx),
            name
        };
        transfer::public_transfer(eagle, tx_context::sender(ctx))
    }
} 