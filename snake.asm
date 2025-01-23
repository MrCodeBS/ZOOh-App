section .data
    msg db 'Game Over!', 0x0
    score_msg db 'Score: ', 0x0
    snake_head db 'O'
    snake_body db '*'
    food db '@'

section .bss
    snake resb 256 ; Snake body storage
    snake_length resb 1 ; Length of the snake
    food_pos resb 2 ; Food position (row, col)
    snake_dir resb 1 ; Current direction (0=up, 1=right, 2=down, 3=left)

section .text
    global _start

_start:
    ; Initialize the game
    mov byte [snake_dir], 1 ; Start moving right
    mov byte [snake], 0x18 ; Initial position (row)
    mov byte [snake+1], 0x28 ; Initial position (col)
    mov byte [snake_length], 2 ; Initial snake length

    ; Generate first food
    call place_food

    ; Game loop
game_loop:
    call draw_snake
    call draw_food
    call get_input
    call update_snake

    ; Check collision with food or boundaries
    call check_collision

    ; Delay to slow down the game
    call delay
    jmp game_loop

; Function to place food randomly
place_food:
    mov ah, 0x2C       ; Get system time for randomness
    int 0x21
    mov al, dl         ; Use low byte of seconds for row
    and al, 0x1F       ; Limit to screen rows (0-31)
    mov [food_pos], al
    mov al, dh         ; Use high byte of seconds for column
    and al, 0x4F       ; Limit to screen columns (0-79)
    mov [food_pos+1], al
    ret

; Function to draw the snake on the screen
draw_snake:
    mov cx, [snake_length]
    mov si, snake
.draw_body:
    mov al, [si]
    mov dl, [si+1]
    call draw_char
    add si, 2
    loop .draw_body
    ret

; Function to draw a character at a specific position
draw_char:
    mov ah, 0x02       ; BIOS set cursor position
    mov bh, 0          ; Page number
    mov dh, al         ; Row
    mov dl, [si+1]     ; Column
    int 0x10
    mov ah, 0x09       ; BIOS write character
    mov al, snake_body ; Character to draw
    mov bl, 0x07       ; White color
    mov cx, 1          ; Repeat once
    int 0x10
    ret

; Function to draw the food on the screen
draw_food:
    mov al, [food_pos]
    mov dl, [food_pos+1]
    call draw_char_food
    ret

draw_char_food:
    mov ah, 0x02       ; BIOS set cursor position
    mov bh, 0          ; Page number
    mov dh, al         ; Row
    mov dl, [food_pos+1] ; Column
    int 0x10
    mov ah, 0x09       ; BIOS write character
    mov al, food       ; Character to draw
    mov bl, 0x04       ; Red color
    mov cx, 1          ; Repeat once
    int 0x10
    ret

; Function to get keyboard input
get_input:
    mov ah, 0x01       ; Check for key press
    int 0x16
    jz .no_input
    mov ah, 0x00       ; Get key press
    int 0x16
    cmp al, 0x48       ; Up arrow
    je .set_up
    cmp al, 0x4D       ; Right arrow
    je .set_right
    cmp al, 0x50       ; Down arrow
    je .set_down
    cmp al, 0x4B       ; Left arrow
    je .set_left
    jmp .no_input
.set_up:
    mov byte [snake_dir], 0
    jmp .no_input
.set_right:
    mov byte [snake_dir], 1
    jmp .no_input
.set_down:
    mov byte [snake_dir], 2
    jmp .no_input
.set_left:
    mov byte [snake_dir], 3
.no_input:
    ret

; Function to update the snake position
update_snake:
    ; Shift body positions
    mov cx, [snake_length]
    dec cx
    mov si, snake
    add si, cx
.update_body:
    mov al, [si-2]
    mov [si], al
    mov al, [si-1]
    mov [si+1], al
    sub si, 2
    loop .update_body

    ; Update head position based on direction
    mov al, [snake]
    mov dl, [snake+1]
    cmp byte [snake_dir], 0
    je .move_up
    cmp byte [snake_dir], 1
    je .move_right
    cmp byte [snake_dir], 2
    je .move_down
    cmp byte [snake_dir], 3
    je .move_left
.move_up:
    dec al
    jmp .update_done
.move_right:
    inc dl
    jmp .update_done
.move_down:
    inc al
    jmp .update_done
.move_left:
    dec dl
.update_done:
    mov [snake], al
    mov [snake+1], dl
    ret

; Function to check collision with boundaries or food
check_collision:
    ; Check boundaries
    mov al, [snake]
    cmp al, 0
    jl game_over
    cmp al, 24
    jge game_over
    mov dl, [snake+1]
    cmp dl, 0
    jl game_over
    cmp dl, 80
    jge game_over

    ; Check collision with food
    mov al, [snake]
    cmp al, [food_pos]
    jne .no_food
    mov dl, [snake+1]
    cmp dl, [food_pos+1]
    jne .no_food
    call eat_food
.no_food:
    ret

; Handle eating food
eat_food:
    inc byte [snake_length]
    call place_food
    ret

; Game over handling
game_over:
    mov dx, msg
    mov ah, 0x09       ; Print string
    int 0x21
    mov ah, 0x4C       ; Exit
    int 0x21

; Delay function to slow down the game
delay:
    mov cx, 0xFFFF
.wait:
    loop .wait
    ret

; Exit the program
_exit:
    mov eax, 1      ; Syscall for exit
    xor ebx, ebx    ; Return code 0
    int 0x80
